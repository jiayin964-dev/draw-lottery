let pool = {
  taskList: [],
  drawnIndex: new Set()
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { action } = req.query;

    // 管理员：初始化任务池
    if (req.method === "POST" && action === "init") {
      const body = req.body;
      const tasks = body.tasks;
      if (!Array.isArray(tasks) || tasks.length === 0) {
        return res.json({ success: false, msg: "任务列表不能为空" });
      }
      // 洗牌打乱任务
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

    // 管理员：重置清空
    if (req.method === "POST" && action === "reset") {
      pool = { taskList: [], drawnIndex: new Set() };
      return res.json({ success: true, msg: "✅任务池已清空重置" });
    }

    // 用户抽签接口（GET，转盘点击调用这个）
    if (req.method === "GET" && action === "draw") {
      const total = pool.taskList.length;
      if (total === 0) {
        return res.json({ success: false, msg: "任务池还没有初始化，请等待管理员配置" });
      }
      if (pool.drawnIndex.size >= total) {
        return res.json({ success: false, msg: "所有任务已经被抽完啦" });
      }
      // 找一个还没被抽取的索引
      let pickIndex;
      do {
        pickIndex = Math.floor(Math.random() * total);
      } while (pool.drawnIndex.has(pickIndex));

      pool.drawnIndex.add(pickIndex);
      const myTask = pool.taskList[pickIndex];
      // 只返回当前抽到的任务！不返回任何池子信息
      return res.json({
        success: true,
        task: myTask
      });
    }

    return res.json({ success: false, msg: "非法请求" });
  } catch (err) {
    return res.json({ success: false, msg: "后端异常：" + err.message });
  }
}
