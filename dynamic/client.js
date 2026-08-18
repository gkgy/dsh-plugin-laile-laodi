// dsh-plugin-laile-laodi —— 动态插件 Client 代码体
// 用途:配合 dynamic/host.js,通过 cordis_define 以“动态插件”方式加载。
// 把本文件内容原样填入 cordis_define 的 code.client 字段(它是一个函数体,以 return { 开头)。
//
// 行为:在会话的输入区插槽挂一个隐藏 <audio> 元素;
// 监听会话快照——当一轮回复【结束】(turnEnds 新增已完成 turn,或出现新的已完成助手消息节点)时,
// 播放一次“来了,老弟”。挂载时只播种历史数据,不为旧回复发声;一轮回复只响一次。
return {
  apply(ctx) {
    const slots = ctx.get('slots')
    if (slots === undefined) return
    slots.inject('conversation.input.dock', () => slots.register(
      { name: 'conversation.input.dock', id: 'laile-laodi', order: 100 },
      (props) => {
        // 已播放过的最后完成 turn;挂载时先用历史数据播种,旧回复不发声
        const played = React.useRef(null)
        const audioRef = React.useRef(null)
        React.useEffect(() => {
          const snap = props.session
          if (!snap) return
          // 主信号:turnEnds —— 已完成(turn/end)的 turn 号,即回复已结束
          let lastDoneTurn = null
          const ends = snap.turnEnds
          if (ends && typeof ends.keys === 'function') {
            for (const t of ends.keys()) {
              if (typeof t === 'number' && (lastDoneTurn === null || t > lastDoneTurn)) lastDoneTurn = t
            }
          }
          // 兜底信号:已完成的助手消息节点(回复落盘完成)
          let lastAssistantTurn = null
          const nodes = snap.nodes
          if (Array.isArray(nodes)) {
            for (let i = 0; i < nodes.length; i++) {
              const n = nodes[i]
              if (n && n.kind === 'assistant' && typeof n.turn === 'number' && (lastAssistantTurn === null || n.turn > lastAssistantTurn)) lastAssistantTurn = n.turn
            }
          }
          const newestDone = lastDoneTurn !== null ? lastDoneTurn : lastAssistantTurn
          if (newestDone === null) return
          const last = played.current
          if (last === null) {
            // 首次挂载:只播种,不为历史回复发声
            played.current = newestDone
            return
          }
          if (newestDone > last) {
            played.current = newestDone
            if (audioRef.current) {
              const el = audioRef.current
              try {
                el.currentTime = 0
                const p = el.play()
                if (p && typeof p.catch === 'function') p.catch(() => {})
              } catch (e) { /* 自动播放被浏览器拦截时静默忽略 */ }
            }
          }
        }, [props.session])
        return React.createElement('audio', {
          ref: audioRef,
          src: '/laile-laodi.mp3',
          preload: 'auto',
          style: { display: 'none' },
        })
      },
    ))
  },
}
