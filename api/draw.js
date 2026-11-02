let pool = {
  taskList: [],
  drawnIndex: new Set()
};
// 自己在这里改管理员密码
const ADMIN_PWD = "123456";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { action, pwd } = req.query;

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

    if (req.method === "POST" && action === "reset") {
      pool = { taskList: [], drawnIndex: new Set() };
      return res.json({ success: true, msg: "✅任务池已清空重置" });
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

    // 管理员查询进度接口（需要密码）
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
