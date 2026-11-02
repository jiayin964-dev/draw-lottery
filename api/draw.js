let pool = {
  taskList: [],
  drawnIndex: new Set()
};
const ADMIN_PWD = "123456"; //改成你的密码

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { action, pwd } = req.query;

    // 初始化任务池
    if (req.method === "POST" && action === "init") {
      const body = req.body;
      const tasks = body.tasks;
      if (!Array.isArray(tasks) || tasks.length === 0) {
        return res.json({ success: false, msg: "任务列表不能为空" });
      }
      const shuffle = arr => {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
      };
      pool = {
        taskList: shuffle(tasks),
        drawnIndex: new Set()
      };
      return res.json({ success: true, msg: "✅任务池初始化完成" });
    }

    // 完全重置：清空任务+清空抽取记录
    if (req.method === "POST" && action === "reset") {
      pool = { taskList: [], drawnIndex: new Set() };
      return res.json({ success: true, msg: "✅全部清空：任务列表和抽取记录都删掉了" });
    }

    // ✅新增：只重置抽取记录，保留任务列表（测试专用）
    if (req.method === "POST" && action === "resetDrawn") {
      if(pwd !== ADMIN_PWD){
        return res.json({ success: false, msg: "密码错误" });
      }
      pool.drawnIndex.clear();
      return res.json({ success: true, msg: "✅抽取记录已重置，任务保留，可以重新抽签测试" });
    }

    // 用户抽签
    if (req.method === "GET" && action === "draw") {
      const total = pool.taskList.length;
      if (total === 0) {
        return res.json({ success: false, msg: "任务池还没有初始化，请等待管理员配置" });
      }
      if (pool.drawnIndex.size >= total) {
        return res.json({ success: false, msg: "所有任务已经被抽完啦" });
      }
      let pickIndex;
      do {
        pickIndex = Math.floor(Math.random() * total);
      } while (pool.drawnIndex.has(pickIndex));

      pool.drawnIndex.add(pickIndex);
      const myTask = pool.taskList[pickIndex];
      return res.json({ success: true, task: myTask });
    }

    // 查询进度
    if (req.method === "GET" && action === "getStatus") {
      if (pwd !== ADMIN_PWD) {
        return res.json({ success: false, msg: "密码错误，无法查看" });
      }
      return res.json({
        success: true,
        total: pool.taskList.length,
        drawnCount: pool.drawnIndex.size
      });
    }

    return res.json({ success: false, msg: "非法操作" });
  } catch (err) {
    return res.json({ success: false, msg: "后端异常：" + err.message });
  }
}
