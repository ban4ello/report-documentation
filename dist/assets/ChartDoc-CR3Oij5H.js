import{s as C}from"./index-BZC4H6UD.js";import{s as P}from"./index-C1TdiokB.js";import{u as V,r as a,o as h,w as k,a as B,k as D,e as M,b as o,d as s}from"./index-CZmPgcIN.js";const S={class:"col-span-12 xl:col-span-6"},w={class:"card"},O=o("div",{class:"font-semibold text-xl mb-4"},"Linear",-1),F={class:"col-span-12 xl:col-span-6"},J={class:"card"},A=o("div",{class:"font-semibold text-xl mb-4"},"Bar",-1),H={class:"col-span-12 xl:col-span-6"},E={class:"card flex flex-col items-center"},L=o("div",{class:"font-semibold text-xl mb-4"},"Pie",-1),N={class:"col-span-12 xl:col-span-6"},R={class:"card flex flex-col items-center"},T=o("div",{class:"font-semibold text-xl mb-4"},"Doughnut",-1),I={class:"col-span-12 xl:col-span-6"},$={class:"card flex flex-col items-center"},j=o("div",{class:"font-semibold text-xl mb-4"},"Polar Area",-1),q={class:"col-span-12 xl:col-span-6"},z={class:"card flex flex-col items-center"},G=o("div",{class:"font-semibold text-xl mb-4"},"Radar",-1),X={__name:"ChartDoc",setup(K){const{getPrimary:m,getSurface:f,isDarkTheme:x}=V(),i=a(null),n=a(null),p=a(null),c=a(null),u=a(null),g=a(null),d=a(null),y=a(null),_=a(null),b=a(null);h(()=>{v()});function v(){const e=getComputedStyle(document.documentElement),l=e.getPropertyValue("--text-color"),t=e.getPropertyValue("--text-color-secondary"),r=e.getPropertyValue("--surface-border");c.value={labels:["January","February","March","April","May","June","July"],datasets:[{label:"My First dataset",backgroundColor:e.getPropertyValue("--p-primary-500"),borderColor:e.getPropertyValue("--p-primary-500"),data:[65,59,80,81,56,55,40]},{label:"My Second dataset",backgroundColor:e.getPropertyValue("--p-primary-200"),borderColor:e.getPropertyValue("--p-primary-200"),data:[28,48,40,19,86,27,90]}]},_.value={plugins:{legend:{labels:{fontColor:l}}},scales:{x:{ticks:{color:t,font:{weight:500}},grid:{display:!1,drawBorder:!1}},y:{ticks:{color:t},grid:{color:r,drawBorder:!1}}}},n.value={labels:["A","B","C"],datasets:[{data:[540,325,702],backgroundColor:[e.getPropertyValue("--p-indigo-500"),e.getPropertyValue("--p-purple-500"),e.getPropertyValue("--p-teal-500")],hoverBackgroundColor:[e.getPropertyValue("--p-indigo-400"),e.getPropertyValue("--p-purple-400"),e.getPropertyValue("--p-teal-400")]}]},d.value={plugins:{legend:{labels:{usePointStyle:!0,color:l}}}},i.value={labels:["January","February","March","April","May","June","July"],datasets:[{label:"First Dataset",data:[65,59,80,81,56,55,40],fill:!1,backgroundColor:e.getPropertyValue("--p-primary-500"),borderColor:e.getPropertyValue("--p-primary-500"),tension:.4},{label:"Second Dataset",data:[28,48,40,19,86,27,90],fill:!1,backgroundColor:e.getPropertyValue("--p-primary-200"),borderColor:e.getPropertyValue("--p-primary-200"),tension:.4}]},g.value={plugins:{legend:{labels:{fontColor:l}}},scales:{x:{ticks:{color:t},grid:{color:r,drawBorder:!1}},y:{ticks:{color:t},grid:{color:r,drawBorder:!1}}}},p.value={datasets:[{data:[11,16,7,3],backgroundColor:[e.getPropertyValue("--p-indigo-500"),e.getPropertyValue("--p-purple-500"),e.getPropertyValue("--p-teal-500"),e.getPropertyValue("--p-orange-500")],label:"My dataset"}],labels:["Indigo","Purple","Teal","Orange"]},y.value={plugins:{legend:{labels:{color:l}}},scales:{r:{grid:{color:r}}}},u.value={labels:["Eating","Drinking","Sleeping","Designing","Coding","Cycling","Running"],datasets:[{label:"My First dataset",borderColor:e.getPropertyValue("--p-indigo-400"),pointBackgroundColor:e.getPropertyValue("--p-indigo-400"),pointBorderColor:e.getPropertyValue("--p-indigo-400"),pointHoverBackgroundColor:l,pointHoverBorderColor:e.getPropertyValue("--p-indigo-400"),data:[65,59,90,81,56,55,40]},{label:"My Second dataset",borderColor:e.getPropertyValue("--p-purple-400"),pointBackgroundColor:e.getPropertyValue("--p-purple-400"),pointBorderColor:e.getPropertyValue("--p-purple-400"),pointHoverBackgroundColor:l,pointHoverBorderColor:e.getPropertyValue("--p-purple-400"),data:[28,48,40,19,96,27,100]}]},b.value={plugins:{legend:{labels:{fontColor:l}}},scales:{r:{grid:{color:t}}}}}return k([m,f,x],()=>{v()},{immediate:!0}),(e,l)=>{const t=P,r=C;return B(),D(r,{class:"grid grid-cols-12 gap-8"},{default:M(()=>[o("div",S,[o("div",w,[O,s(t,{type:"line",data:i.value,options:g.value},null,8,["data","options"])])]),o("div",F,[o("div",J,[A,s(t,{type:"bar",data:c.value,options:_.value},null,8,["data","options"])])]),o("div",H,[o("div",E,[L,s(t,{type:"pie",data:n.value,options:d.value},null,8,["data","options"])])]),o("div",N,[o("div",R,[T,s(t,{type:"doughnut",data:n.value,options:d.value},null,8,["data","options"])])]),o("div",I,[o("div",$,[j,s(t,{type:"polarArea",data:p.value,options:y.value},null,8,["data","options"])])]),o("div",q,[o("div",z,[G,s(t,{type:"radar",data:u.value,options:b.value},null,8,["data","options"])])])]),_:1})}}};export{X as default};
