#!/bin/bash
set -e
BASE=http://localhost:5000/api/v1
EXTRACT() { node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).$1" 2>/dev/null; }

LOGIN=$(curl -s -X POST $BASE/crm/auth/login -H "Content-Type: application/json" -d '{"email":"admin@langdi.local","password":"Admin@12345"}')
ACCESS=$(echo "$LOGIN" | EXTRACT "data.accessToken")
H="Authorization: Bearer $ACCESS"
echo "admin login OK"

echo
echo "=== 1) GET /dashboard/overview ==="
curl -s $BASE/crm/dashboard/overview -H "$H" | node -pe "JSON.stringify(JSON.parse(require('fs').readFileSync(0,'utf8')).data,null,2)"

echo
echo "=== 2) GET /dashboard/stage-funnel ==="
curl -s $BASE/crm/dashboard/stage-funnel -H "$H" | node -pe "const d=JSON.parse(require('fs').readFileSync(0,'utf8'));d.data.map(s=>s.order+'. '+s.name+': '+s.leadCount+' leads').join('\n')"

echo
echo "=== 3) GET /dashboard/salesperson-performance ==="
curl -s $BASE/crm/dashboard/salesperson-performance -H "$H" | node -pe "const d=JSON.parse(require('fs').readFileSync(0,'utf8'));d.data.map(s=>s.name+' — total:'+s.total+' won:'+s.won+' active:'+s.active+' conv:'+s.conversionRate+'% revenue:'+s.totalRevenue).join('\n')"

echo
echo "=== 4) GET /dashboard/source-breakdown ==="
curl -s $BASE/crm/dashboard/source-breakdown -H "$H" | node -pe "const d=JSON.parse(require('fs').readFileSync(0,'utf8'));d.data.map(s=>s.source+': enq='+s.enquiryCount+' leads='+s.totalLeads+' won='+s.wonLeads+' conv='+s.conversionRate+'%').join('\n')"

echo
echo "=== 5) GET /dashboard/temperature-breakdown ==="
curl -s $BASE/crm/dashboard/temperature-breakdown -H "$H" | node -pe "const d=JSON.parse(require('fs').readFileSync(0,'utf8'));d.data.map(s=>s.temperature+': '+s.count+' (active:'+s.active+' won:'+s.won+' lost:'+s.lost+')').join('\n')"

echo
echo "=== 6) GET /dashboard/negotiation-pipeline ==="
curl -s $BASE/crm/dashboard/negotiation-pipeline -H "$H" | node -pe "JSON.stringify(JSON.parse(require('fs').readFileSync(0,'utf8')).data)"

echo
echo "=== 7) GET /dashboard/final-deals ==="
curl -s $BASE/crm/dashboard/final-deals -H "$H" | node -pe "JSON.stringify(JSON.parse(require('fs').readFileSync(0,'utf8')).data)"

echo
echo "=== 8) GET /reports/conversion-funnel ==="
curl -s $BASE/crm/reports/conversion-funnel -H "$H" | node -pe "const d=JSON.parse(require('fs').readFileSync(0,'utf8'));'overall: '+d.data.overallConversionRate+'%\n'+d.data.stages.map(s=>'  '+s.label+': '+s.count+' (prev '+s.pctOfPrevious+'%, top '+s.pctOfTop+'%)').join('\n')"

echo
echo "=== 9) GET /reports/source-analytics ==="
curl -s $BASE/crm/reports/source-analytics -H "$H" | node -pe "const d=JSON.parse(require('fs').readFileSync(0,'utf8'));d.data.slice(0,5).map(s=>s.source+': enq='+s.enquiries+' qual='+s.qualified+' leads='+s.leads+' won='+s.won+' qualRate='+s.qualificationRate+'% winRate='+s.winRate+'%').join('\n')"

echo
echo "=== 10) GET /reports/lost-reasons ==="
curl -s $BASE/crm/reports/lost-reasons -H "$H" | node -pe "const d=JSON.parse(require('fs').readFileSync(0,'utf8'));d.data.length?d.data.map(r=>'  - '+r.reason+': '+r.count+' (revenue lost: '+r.totalRevenueLost+')').join('\n'):'(no lost leads)'"

echo
echo "=== 11) GET /reports/avg-completion-time ==="
curl -s $BASE/crm/reports/avg-completion-time -H "$H" | node -pe "JSON.stringify(JSON.parse(require('fs').readFileSync(0,'utf8')).data)"

echo
echo "=== 12) GET /reports/stage-delay ==="
curl -s $BASE/crm/reports/stage-delay -H "$H" | node -pe "const d=JSON.parse(require('fs').readFileSync(0,'utf8'));d.data.length?d.data.map(s=>'  '+s.stageName+': avg '+s.avgHours+'h ('+s.avgDays+'d) from '+s.sampleCount+' transitions').join('\n'):'(no transitions yet)'"

echo
echo "=== 13) GET /reports/salesperson-scorecard ==="
curl -s $BASE/crm/reports/salesperson-scorecard -H "$H" | node -pe "const d=JSON.parse(require('fs').readFileSync(0,'utf8'));d.data.map(s=>s.name+' ('+s.role+'): total='+s.total+' won='+s.won+' revenue='+s.revenue+' winRate='+s.winRate+'% avgClose='+s.avgCompletionDays+'d').join('\n')"

echo
echo "=== 14) GET /reports/overdue-followups ==="
curl -s $BASE/crm/reports/overdue-followups -H "$H" | node -pe "const d=JSON.parse(require('fs').readFileSync(0,'utf8'));'total: '+d.data.total+'\n'+d.data.byUser.map(u=>'  '+u.name+': '+u.count).join('\n')"

echo
echo "=== 15) Filter test: dashboard/overview?source=website ==="
curl -s "$BASE/crm/dashboard/overview?source=website" -H "$H" | node -pe "const d=JSON.parse(require('fs').readFileSync(0,'utf8')).data;'enquiries='+d.totalEnquiries+' leads='+d.totalLeads+' conv='+d.conversionRate+'%'"

echo
echo "=== 16) Date filter: dashboard/overview?from=2025-01-01&to=2026-12-31 ==="
curl -s "$BASE/crm/dashboard/overview?from=2025-01-01&to=2026-12-31" -H "$H" | node -pe "const d=JSON.parse(require('fs').readFileSync(0,'utf8')).data;'enq='+d.totalEnquiries+' leads='+d.totalLeads"

echo
echo "=== 17) RBAC: Sales Person tries report:view (only Sales Coord+Admin have it) ==="
SLOGIN=$(curl -s -X POST $BASE/crm/auth/login -H "Content-Type: application/json" -d '{"email":"sales1@langdi.local","password":"Sales@12345"}')
SACCESS=$(echo "$SLOGIN" | EXTRACT "data.accessToken")
curl -s $BASE/crm/reports/conversion-funnel -H "Authorization: Bearer $SACCESS"; echo

echo
echo "=== 18) Sales Person can hit dashboard (has dashboard:view) ==="
curl -s $BASE/crm/dashboard/overview -H "Authorization: Bearer $SACCESS" | head -c 200; echo

echo
echo "=== 19) Invalid date format ==="
curl -s "$BASE/crm/dashboard/overview?from=notadate" -H "$H" | head -c 300; echo

echo
echo "=== 20) Bad source enum ==="
curl -s "$BASE/crm/dashboard/overview?source=foo" -H "$H" | head -c 300; echo
