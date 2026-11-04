const test=require('node:test');
const assert=require('node:assert/strict');
process.env.GROQ_API_KEY='gsk_test_only_not_a_real_secret_1234567890';
process.env.GROQ_MODEL='openai/gpt-oss-120b';
const calls=[];
global.fetch=async(url,options={})=>{
  const route=String(url),body=options.body?JSON.parse(options.body):{};
  if(route.endsWith('/models'))return new Response(JSON.stringify({data:[{id:'openai/gpt-oss-120b'}]}),{status:200});
  if(route.endsWith('/chat/completions')){
    calls.push(body);
    if(body.messages?.some(x=>typeof x.content==='string'&&x.content.startsWith('Reply exactly READY')))return new Response(JSON.stringify({choices:[{message:{content:'READY'}}]}),{status:200});
    if(body.response_format){const probe=body.messages?.find(x=>x.tool_call_id==='probe-1');const content=probe?{ok:true,label:'khulansense-test'}:{action:'ANOMALY_FLAGGED',priority:'MODERATE',confidence:.72,uncertainty:0,summary:'Processed signals warrant a human review.',reasoning:'The cited tool results show an elevated visitation deviation and complete recent coverage.',evidence:[{feature:'mean_rain_30d',value:5},{feature:'coverage',value:1}],review_required:true};return new Response(JSON.stringify({choices:[{message:{content:JSON.stringify(content)}}]}),{status:200})}
    if(body.tool_choice==='required'&&body.tools?.[0]?.function?.name==='connection_probe'){
      return new Response(JSON.stringify({choices:[{message:{tool_calls:[{id:'probe-1',type:'function',function:{name:'connection_probe',arguments:'{"label":"khulansense-test"}'}}]}}]}),{status:200});
    }
    if(body.tool_choice==='required')return new Response(JSON.stringify({choices:[{message:{tool_calls:[{id:'eval-1',type:'function',function:{name:'inspect_evaluation_features',arguments:'{"case_id":0}'}}]}}]}),{status:200});
    const done=body.messages.filter(x=>x.role==='tool');
    if(done.length===0)return new Response(JSON.stringify({choices:[{message:{tool_calls:[{id:'env-1',type:'function',function:{name:'inspect_environment',arguments:'{"collar":"A1","cutoff":"2018-01-02"}'}}]}}]}),{status:200});
    if(done.length===1)return new Response(JSON.stringify({choices:[{message:{tool_calls:[{id:'quality-1',type:'function',function:{name:'assess_data_quality',arguments:'{"collar":"A1","cutoff":"2018-01-02"}'}}]}}]}),{status:200});
    if(done.length>=2){const decision={action:'ANOMALY_FLAGGED',priority:'MODERATE',confidence:.72,uncertainty:0,summary:'Processed signals warrant a human review.',reasoning:'The cited tool results show elevated context and complete coverage.',evidence:[{feature:'mean_rain_30d',value:5},{feature:'coverage',value:1}],review_required:true};return new Response(JSON.stringify({choices:[{message:{content:JSON.stringify(decision)}}]}),{status:200})}
    return new Response(JSON.stringify({choices:[{message:{content:'I have enough evidence.'}}]}),{status:200});
  }
  return new Response('{}',{status:404});
};
const {agentRun,testGroq,validate,runTool,chooseModel}=require('../server');
function fixture(){const day=Date.parse('2018-01-02T00:00:00Z');return{collar:'A1',cutoff:'2018-01-02',rows:[{collar:'A1',day:day-86400000,dateText:'2018-01-01',observed:true,rain_30d:10,rain_7d:2,ndvi:.4,ndvi_anom:0,snow:0,temp_c:5,qc_missing_env:false,env_interpolated:false,quality14:1,uncertainty:0,z_speed:0,z_visit:0},{collar:'A1',day,dateText:'2018-01-02',observed:true,rain_30d:0,rain_7d:0,ndvi:.3,ndvi_anom:-.5,snow:0,temp_c:4,qc_missing_env:false,env_interpolated:false,quality14:1,uncertainty:0,z_speed:2.2,z_visit:1.5,speed_kmd:3,n_visits:2,visit_rate_7d:1,visit_rate_30d:1,days_since_visit:0,changepoint_speed:0,changepoint_visit:0,anomaly_flag:false}],sourceQuality:[],population:[]}}
test('account model discovery selects the preferred supported model',async()=>assert.equal(await chooseModel(),'openai/gpt-oss-120b'));
test('real processed tool functions return cutoff-bounded environmental and quality evidence',()=>{const b=fixture(),c={...b,ms:Date.parse(b.cutoff+'T00:00:00Z'),source:[],population:[]};const e=runTool('inspect_environment',{collar:b.collar,cutoff:b.cutoff},c),q=runTool('assess_data_quality',{collar:b.collar,cutoff:b.cutoff},c);assert.equal(e.cutoff,b.cutoff);assert.equal(e.mean_rain_30d,5);assert.equal(q.coverage,1)});
test('agent dynamically requests different tools, sees results, and returns validated structured JSON',async()=>{calls.length=0;const r=await agentRun(fixture());assert.equal(r.status,'success');assert.equal(r.decision.action,'ANOMALY_FLAGGED');assert.equal(r.decision.review_required,true);assert.deepEqual(r.trace.map(x=>x.tool),['inspect_environment','assess_data_quality']);assert.ok(calls.some(x=>x.messages.filter(m=>m.role==='tool').length===2));const finalCall=calls.find(x=>x.response_format?.type==='json_schema');assert.equal(finalCall.response_format.json_schema.strict,true);assert.deepEqual(finalCall.response_format.json_schema.schema.properties.evidence.items.properties.value.anyOf.map(x=>x.type),['string','number','boolean','null']);assert.equal(r.decision.evidence.length,2)});
test('tool execution rejects a changed historical cutoff',()=>{const b=fixture(),c={...b,ms:Date.parse(b.cutoff+'T00:00:00Z'),source:[],population:[]};assert.throws(()=>runTool('inspect_environment',{collar:'A1',cutoff:'2019-01-01'},c),e=>e.code==='invalid_tool_call')});
test('backend tool context excludes rows after selected cutoff',async()=>{const b=fixture(),future={...b.rows[1],day:b.rows[1].day+86400000,dateText:'2018-01-03',rain_30d:999};b.rows.push(future);calls.length=0;const r=await agentRun(b);assert.equal(r.trace[0].result.cutoff,'2018-01-02');assert.equal(r.trace[0].result.mean_rain_30d,5)});
test('fabricated evidence is rejected',()=>{const d={action:'ANOMALY_FLAGGED',priority:'MODERATE',confidence:.5,uncertainty:.2,summary:'x',reasoning:'y',evidence:[{feature:'fake_measurement',value:999}],review_required:true};assert.throws(()=>validate(d,[],{collar:'A1',cutoff:'2018-01-02'}),e=>e.code==='invalid_agent_output')});
test('missing ecological data is reported distinctly',async()=>{await assert.rejects(()=>agentRun({collar:'A1',cutoff:'2018-01-02',rows:[]}),e=>e.code==='missing_ecological_data')});
test('nonexistent calendar dates are rejected before any model call',async()=>{calls.length=0;await assert.rejects(()=>agentRun({collar:'A1',cutoff:'2018-02-30',rows:fixture().rows}),e=>e.code==='invalid_input');assert.equal(calls.length,0)});
test('Groq health test performs basic chat, forced tool call and result round-trip',async()=>{calls.length=0;const r=await testGroq();assert.equal(r.basic_chat,true);assert.equal(r.tool_call,true);assert.equal(r.tool_execution,true);assert.equal(r.tool_result_round_trip,true);assert.equal(r.final_json,true)});
test('frontend source contains no provider URL, authorization header or key state',()=>{const s=require('node:fs').readFileSync(require('node:path').join(__dirname,'../public/app.js'),'utf8');assert.doesNotMatch(s,/api\.groq\.com|Authorization:|state\.apiKey/);assert.match(s,/fetch\('\/api\/agent\/run'/)});
