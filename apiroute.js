// api/route.js
import { NextResponse } from 'next/server';

let pool = {
    players: [],
    tasks: [],
    map: {},
    drawn: {}
}

export async function GET(req) {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");
    const name = url.searchParams.get("name");

    if(action === "list"){
        return NextResponse.json({players:pool.players});
    }
    if(action === "draw"){
        if(!pool.map[name]) return NextResponse.json({success:false,msg:"未找到该人"});
        if(pool.drawn[name]) return NextResponse.json({success:false,msg:"你已经抽过啦"});
        pool.drawn[name] = true;
        return NextResponse.json({success:true,task:pool.map[name]});
    }
    return NextResponse.json({msg:"ok"});
}

export async function POST(req) {
    const body = await req.json();
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    if(action === "init"){
        const {players,tasks} = body;
        if(players.length !== tasks.length) return NextResponse.json({msg:"名单和任务数量不一致！"});
        //洗牌
        const t = [...tasks];
        for(let i = t.length-1;i>0;i--){
            const j = Math.floor(Math.random()*(i+1));
            [t[i],t[j]] = [t[j],t[i]];
        }
        const newMap = {};
        players.forEach((p,idx)=>newMap[p] = t[idx]);
        pool = {players,tasks,map:newMap,drawn:{}};
        return NextResponse.json({msg:"分配成功！可以发链接给大家抽签了"});
    }
    if(action === "reset"){
        pool = {players:[],tasks:[],map:{},drawn:{}};
        return NextResponse.json({msg:"已重置"});
    }
    return NextResponse.json({msg:"ok"});
}
