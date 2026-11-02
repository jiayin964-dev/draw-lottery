// 全局池：只存在后端内存，不对外返回完整列表
let pool = {
  players: [],     // 人员名单
  tasks: [],       // 和人员一一绑定、打乱后的任务
  drawn: new Set() // 已经抽过签的人
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { action, name } = req.query;

    if (req.method === "POST") {
      // 管理员初始化：传入人员列表、任务列表，自动打乱任务配对
      if (action === "init") {
        const body = req.body;
        const pList = body.players;
        const tList = body.tasks;
        if (!Array.isArray(pList) || !Array.isArray(tList) || pList.length !== tList.length) {
          return res.json({ success: false, msg: "人员数量和任务数量必须相等！" });
        }
        // 洗牌函数：打乱任务
        const shuffle = arr => {
          const a = [...arr];
          for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
          }
          return a;
        };
        const shuffledTasks = shuffle(tList);
        pool = {
          players: pList,
          tasks: shuffledTasks,
          drawn: new Set()
        };
        return res.json({ success: true, msg: "✅抽签池初始化完成，任务已打乱绑定" });
      }
      // 管理员重置
      if (action === "reset") {
        pool = { players: [], tasks: [], drawn: new Set() };
        return res.json({ success: true, msg: "✅抽签池已清空" });
      }
    }

    if (req.method === "GET") {
      // 用户抽签接口：输入名字，只返回自己任务
      if (action === "draw") {
        const findIndex = pool.players.indexOf(name);
        if (findIndex === -1) {
          return res.json({ success: false, msg: "你的名字不在名单内，请核对" });
        }
        if (pool.drawn.has(name)) {
          return res.json({ success: false, msg: "你已经抽过签了，不能重复抽取" });
        }
        // 标记已抽取
        pool.drawn.add(name);
        const myTask = pool.tasks[findIndex];
        return res.json({
          success: true,
          task: myTask
          // ⚠️关键：这里绝不返回 players、tasks、drawn 列表！
        });
      }
    }

    return res.json({ success: false, msg: "非法操作" });
  } catch (err) {
    return res.json({ success: false, msg: "后端异常：" + err.message });
  }
}
