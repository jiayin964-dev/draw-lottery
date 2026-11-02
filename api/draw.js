// api/draw.js
let pool = {
  players: [],
  tasks: [],
  map: {}
};

export default async function handler(req) {
  const url = new URL(req.url);
  const action = url.searchParams.get("action");
  const name = url.searchParams.get("name");

  if (req.method === "POST") {
    const body = await req.json();
    if (action === "init") {
      const p = body.players;
      const t = body.tasks;
      if (p.length !== t.length) {
        return Response.json({ success: false, msg: "人数和任务数量不一致！" });
      }
      // 打乱
      const shuffle = arr => {
        const a = [...arr];
        for(let i=a.length-1;i>0;i--){
          const j = Math.floor(Math.random()*(i+1));
          [a[i],a[j]] = [a[j],a[i]];
        }
        return a;
      };
      const shuffledTask = shuffle(t);
      const newMap = {};
      p.forEach((person,idx)=>{
        newMap[person] = shuffledTask[idx];
      })
      pool = { players:p, tasks:t, map:newMap };
      return Response.json({ success:true, msg:"✅抽签池初始化完成" });
    }
    if(action === "reset"){
      pool = { players:[], tasks:[], map:{} };
      return Response.json({ success:true, msg:"✅已清空抽签池" });
    }
  }

  if(req.method === "GET"){
    if(action === "list"){
      return Response.json({ players: pool.players });
    }
    if(action === "draw"){
      if(!pool.map[name]) return Response.json({success:false, msg:"找不到该人或者已经抽签"})
      return Response.json({success:true, task: pool.map[name]})
    }
  }
  return Response.json({success:false, msg:"非法请求"});
}
