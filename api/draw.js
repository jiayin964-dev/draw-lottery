let pool = {
  players: [],
  tasks: [],
  map: {}
};

module.exports = async function handler(req, res) {
  const { action, name } = req.query;

  if (req.method === "POST") {
    const body = req.body;
    if (action === "init") {
      const p = body.players;
      const t = body.tasks;
      if (p.length !== t.length) {
        return res.json({ success: false, msg: "人数和任务数量不一致！" });
      }
      const shuffle = arr => {
        const a = [...arr];
        for(let i = a.length - 1; i > 0; i--){
          const j = Math.floor(Math.random() * (i + 1));
          [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
      };
      const shuffledTask = shuffle(t);
      const newMap = {};
      p.forEach((person, idx) => {
        newMap[person] = shuffledTask[idx];
      });
      pool = { players:p, tasks:t, map:newMap };
      return res.json({ success:true, msg:"✅抽签池初始化完成" });
    }
    if(action === "reset"){
      pool = { players:[], tasks:[], map:{} };
      return res.json({ success:true, msg:"✅已清空抽签池" });
    }
  }

  if(req.method === "GET"){
    if(action === "list"){
      return res.json({ players: pool.players });
    }
    if(action === "draw"){
      if(!pool.map[name]) return res.json({success:false, msg:"找不到该人或者已经抽签"})
      return res.json({success:true, task: pool.map[name]})
    }
  }
  return res.json({success:false, msg:"非法请求"});
}
