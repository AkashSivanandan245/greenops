export const kpis = [
  { label: 'Total CO2e', value: '42.8t', delta: '-12.4%', tone: 'good' },
  { label: 'Cloud Spend', value: '$318k', delta: '-8.1%', tone: 'good' },
  { label: 'Cost / kg CO2e', value: '$7.43', delta: '-4.6%', tone: 'good' },
  { label: 'Data Freshness', value: '6h', delta: '< 24h SLA', tone: 'neutral' }
];
export const emissions = [
  { day:'Jan', actual:48, forecast:50, target:44 },{ day:'Feb', actual:45, forecast:47, target:43 },{ day:'Mar', actual:44, forecast:45, target:42 },{ day:'Apr', actual:43, forecast:43, target:41 },{ day:'May', actual:41, forecast:40, target:40 },{ day:'Jun', actual:39, forecast:38, target:39 },{ day:'Jul', actual:null, forecast:37, target:38 },{ day:'Aug', actual:null, forecast:36, target:37 },{ day:'Sep', actual:null, forecast:35, target:36 }
];
export const breakdown = [
  { name:'Retail BU', co2e:12.4, spend:92000 },{ name:'Financial Services', co2e:9.6, spend:76000 },{ name:'Data Platforms', co2e:8.8, spend:64000 },{ name:'Internal Labs', co2e:6.3, spend:43000 },{ name:'Managed Services', co2e:5.7, spend:43000 }
];
export const recommendations = [
  { id:'REC-1042', type:'Rightsizing', resource:'aws-prod-ec2-catalog-17', region:'us-east-1', impact:94, co2e:'1.8t', saving:'$18.4k', effort:'Low' },
  { id:'REC-1098', type:'Idle Volume', resource:'az-vm-disk-legacy-09', region:'westeurope', impact:87, co2e:'1.1t', saving:'$9.7k', effort:'Low' },
  { id:'REC-1120', type:'Memory Overprovisioned', resource:'aks-checkout-pool', region:'northeurope', impact:79, co2e:'0.9t', saving:'$7.2k', effort:'Medium' },
  { id:'REC-1186', type:'Spot Opportunity', resource:'batch-etl-nightly', region:'eu-west-1', impact:72, co2e:'0.6t', saving:'$11.1k', effort:'Medium' }
];
export const services = [
  { name:'Payments API', score:'A', value:91, trend:'+6', factors:[96,88,90,91] },{ name:'Catalog Search', score:'B', value:84, trend:'+3', factors:[80,86,88,82] },{ name:'Batch ETL', score:'C', value:72, trend:'-4', factors:[68,74,70,76] },{ name:'Legacy CRM Sync', score:'D', value:61, trend:'-8', factors:[54,66,63,61] }
];
export const regions = [
  { name:'northeurope', intensity:81, provider:'Azure' },{ name:'eu-west-1', intensity:119, provider:'AWS' },{ name:'westeurope', intensity:133, provider:'Azure' },{ name:'us-east-1', intensity:384, provider:'AWS' },{ name:'eastus', intensity:401, provider:'Azure' }
];
