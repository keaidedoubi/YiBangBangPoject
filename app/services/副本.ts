// import { PrismaClient } from '@prisma/client';
// import { EventStream } from '@remix-sse/server';
import * as config from './servicesConfig.json';
import { Readable } from 'stream';
import { prisma } from './db.server';
import { input, user } from '@heroui/react';

// const prisma = new PrismaClient();

//request prop
const max_tokens = config.max_tokens;
const tempreature = config.temperature;
const model_id = config.modelId;
const url = config.url;
const APIkey = config.APIKey;

export async function vertifySessionId(sessionId:string,userId:string) {
    let isBelong = false;
    let notFound = true;
    await prisma.session.findUnique({
        where: { id: sessionId },
    }).then(( res:any )=>{
        if(res != null){ 
            notFound = false; 
            if(res.userId == userId){ 
                isBelong = true;
            }
        }
    })
    return({'isBelong':isBelong,'notFound':notFound})
}

export async function getSessionContent(sessionId:string){
  const conversations: { i: any; o: any; }[] = [];
  await prisma.session.findUnique({
    where: { id: sessionId },
    include: { contents: true },
  }).then(( session:any )=>{
    if(session == null){ return(null); }
    session.contents.forEach(( element: any ) => {
      conversations.push({'i':element.input,'o':element.output}) 
    });
  })
//   console.log(conversations)
  return(conversations);
}

export async function addContent(content:string,userId:string,sessionId:string){
    const legacyContent = [];
    await prisma.session.findUnique({
        where: { id: sessionId },
        include: { contents: true },
    }).then(( session:any )=>{
        if(session == null || session.userId != userId){ return(null); }
        session.contents.forEach((element: any) => {
          legacyContent.push(
            { content: element.input, role: 'user' },
            { content: element.output, role: 'assistant' }
          );
        });
    })
    legacyContent.push({ content:content, role:"user" });
    console.log(legacyContent)
    const request = new Request(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer'+' '+APIkey
        },
        body: JSON.stringify({ 
          messages: legacyContent,
          model:model_id,
          stream:true,
          temperature:tempreature,
          max_tokens:max_tokens,
        }),
      });
    
      const response =  await fetch(request);
      const stream:any = response.body;
      let output = '';
      let id = '';
    
      return(new Response(new ReadableStream({
        async start(controller) {
          for await (const chunk of stream) {
    
            const decoder = new TextDecoder();
            const chunkString = decoder.decode(chunk);
            const lines = chunkString.split('data:');
            
            for (const line of lines){
              const lineTrim = line.trim()
              if(lineTrim != "" && lineTrim != "[DONE]"){
                const data = JSON.parse(lineTrim);
                //TODO:get token sum from the last chunk
                // let tokenSum = data.usage.total_tokens;
                const token = data.choices[0].delta.content;
                output = output + token;
                controller.enqueue(token);
              }
            }
          }
          const input = content;
          await prisma.conversation.create({data:{
            sessionId,
            input,
            output
          }});
          controller.close();
        }
    })));
}


export async function createSession(content:string,userId:string) {
    const legacyContent = [];
    legacyContent.push({ content:content, role:"user" });

    const request = new Request(url, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Bearer'+' '+APIkey
        },
        body: JSON.stringify({ 
            messages: legacyContent,
            model:model_id,
            stream:true,
            temperature:tempreature,
            max_tokens:max_tokens,
        }),
    });
    const response =  await fetch(request);
    const stream:any = response.body;
    let output = '';
    let id = '';

    let sessionId = ''
    let res = await new Response(new ReadableStream({
    async start(controller) {
        for await (const chunk of stream) {

          const decoder = new TextDecoder();
          const chunkString = decoder.decode(chunk);
          const lines = chunkString.split('data:');
        
          for (const line of lines){
            const lineTrim = line.trim()
            if(lineTrim != "" && lineTrim != "[DONE]"){
                const data = JSON.parse(lineTrim);
                id = data.id;
                //TODO:get token sum from the last chunk
                // let tokenSum = data.usage.total_tokens;
                const token = data.choices[0].delta.content;
                output = output + token;
                controller.enqueue(token);
            }
          }
        }
        sessionId = await id;
        const input = content;
        await prisma.session.create({ data:{
            id,
            userId
        }});
        await prisma.conversation.create({data:{
            sessionId,
            input,
            output
        }});
        controller.close();
    }
  }));
  console.log('sessionId:',id)//TODO：new
  return({'sessionId':sessionId,'res':res});
}