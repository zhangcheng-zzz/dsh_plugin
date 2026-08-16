// DeepSeek 余额查询插件 —— Host 半（动态 Cordis Plugin 的 `code.host` 函数体）
//
// 职责：
//   1. 通过 ctx.credentials.resolve('DEEPSEEK_API_KEY') 即时解析当前 API Key。
//   2. 派生运行时自带的 node.exe，用 Node 内置 fetch 请求
//      GET https://api.deepseek.com/user/balance（带 Authorization: Bearer）。
//   3. 将结果规整为 { isAvailable, currency, totalBalance, grantedBalance, toppedUpBalance }。
//
// 该查询逻辑被两处复用：
//   - harness.handle('get-balance', ...)  → 供右下角小组件通过 host.call 调用
//   - harness.defineTool('deepseek_balance', ...) → 供模型直接调用的工具
//
// 注意：动态 Host 沙箱会拦截 fetch/require/process，因此网络请求经由
// ctx.subprocess 派生的 node 子进程完成（沙箱内无 fetch 全局）。

return {
  name: 'deepseek-balance-query',
  apply(ctx) {
    async function queryBalance() {
      const credentials = ctx.get('credentials')
      if (!credentials) throw new Error('credentials 服务不可用')
      const resolved = await credentials.resolve('DEEPSEEK_API_KEY')
      if (!resolved || typeof resolved.value !== 'string' || resolved.value.length === 0) {
        throw new Error('未配置 DeepSeek API Key（DEEPSEEK_API_KEY）。请在模型设置或 .credentials.yaml 中配置。')
      }
      const key = resolved.value

      const subprocess = ctx.get('subprocess')
      if (!subprocess) throw new Error('subprocess 服务不可用')
      let nodePath
      try {
        nodePath = await subprocess.resolveExecutable('node')
      } catch (e) {
        throw new Error('无法解析 node 可执行文件: ' + String(e && e.message ? e.message : e))
      }

      const script = [
        'const u="https://api.deepseek.com/user/balance";',
        'fetch(u,{headers:{Authorization:"Bearer "+process.env.BALANCE_KEY},signal:AbortSignal.timeout(30000)})',
        '.then(async r=>{const t=await r.text();console.log(JSON.stringify({status:r.status,body:t}));})',
        '.then(()=>process.exit(0))',
        '.catch(e=>{console.error(String(e&&e.message?e.message:e));process.exit(1)});'
      ].join('')

      const sp = ctx.get('sandboxPolicy')
      const cwd = (sp && typeof sp.workspaceRoot === 'string' && sp.workspaceRoot.length > 0) ? sp.workspaceRoot : 'C:/'

      const handle = subprocess.spawn({
        argv: [nodePath, '-e', script],
        cwd: cwd,
        stdio: {
          stdin: 'ignore',
          stdout: { maxBytes: 64 * 1024 },
          stderr: { maxBytes: 16 * 1024 }
        },
        graceMs: 5000,
        env: { BALANCE_KEY: key }
      })

      const outcome = await handle.done
      const outReader = handle.collected.stdout
      const errReader = handle.collected.stderr
      const stdoutText = outReader ? outReader.readFrom(0).text : ''
      const stderrText = errReader ? errReader.readFrom(0).text : ''

      if (outcome.exitCode !== 0) {
        throw new Error('查询余额的 node 子进程失败 (exit ' + outcome.exitCode + '): ' + (stderrText || stdoutText).trim())
      }

      let envelope
      try {
        envelope = JSON.parse(stdoutText.trim())
      } catch (e) {
        throw new Error('无法解析余额查询结果: ' + stdoutText.trim())
      }

      if (!envelope || envelope.status !== 200) {
        const code = envelope ? envelope.status : 'unknown'
        throw new Error('DeepSeek 余额接口返回 HTTP ' + code + ': ' + (envelope ? envelope.body : ''))
      }

      let data
      try {
        data = JSON.parse(envelope.body)
      } catch (e) {
        throw new Error('无法解析余额接口响应: ' + envelope.body)
      }

      const infos = Array.isArray(data.balance_infos) ? data.balance_infos : []
      const info = infos[0] || {}
      return {
        isAvailable: data.is_available === true,
        currency: typeof info.currency === 'string' ? info.currency : '',
        totalBalance: info.total_balance != null ? String(info.total_balance) : '',
        grantedBalance: info.granted_balance != null ? String(info.granted_balance) : '',
        toppedUpBalance: info.topped_up_balance != null ? String(info.topped_up_balance) : ''
      }
    }

    harness.handle('get-balance', async () => {
      return await queryBalance()
    })

    const tool = harness.defineTool({
      name: 'deepseek_balance',
      description: '查询当前配置的 DeepSeek API Key（DEEPSEEK_API_KEY）账户余额。返回可用状态、币种、总余额、赠送余额和充值余额。',
      parameters: {},
      output: {
        schema: {
          type: 'object',
          additionalProperties: true,
          properties: {
            isAvailable: { type: 'boolean', description: '账户是否有可用余额' },
            currency: { type: 'string', description: '余额币种，如 CNY' },
            totalBalance: { type: 'string', description: '总余额' },
            grantedBalance: { type: 'string', description: '赠送余额' },
            toppedUpBalance: { type: 'string', description: '充值余额' }
          }
        },
        render(args, value) {
          return [{
            type: 'text',
            text: 'DeepSeek 余额：可用=' + (value.isAvailable ? '是' : '否') +
              '，币种=' + value.currency +
              '，总余额=' + value.totalBalance +
              '，赠送余额=' + value.grantedBalance +
              '，充值余额=' + value.toppedUpBalance
          }]
        }
      },
      async execute(args, exec) {
        return await queryBalance()
      }
    })

    harness.registerTool(ctx, tool)
  }
}
