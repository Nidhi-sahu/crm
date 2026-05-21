#!/bin/bash
set -e
BASE=http://localhost:5000/api/v1
EXTRACT() { node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).$1" 2>/dev/null; }

echo "=== 1) GET /health (enriched) ==="
curl -s $BASE/health | node -pe "JSON.stringify(JSON.parse(require('fs').readFileSync(0,'utf8')).data,null,2)"

echo
echo "=== 2) GET /crm (final phase status) ==="
curl -s $BASE/crm | EXTRACT "data.phase"

LOGIN=$(curl -s -X POST $BASE/crm/auth/login -H "Content-Type: application/json" -d '{"email":"admin@langdi.local","password":"Admin@12345"}')
ACCESS=$(echo "$LOGIN" | EXTRACT "data.accessToken")
H="Authorization: Bearer $ACCESS"
echo
echo "admin login OK (login event should be audited)"

echo
echo "=== 3) PUT /configurations/site.theme ==="
curl -s -X PUT $BASE/crm/configurations/site.theme -H "$H" -H "Content-Type: application/json" -d '{"value":{"primaryColor":"#3B82F6","mode":"light"},"category":"ui","description":"Site theme"}' | head -c 300; echo

echo
echo "=== 4) PUT /configurations/lead.auto-assign.delay-minutes ==="
curl -s -X PUT $BASE/crm/configurations/lead.auto-assign.delay-minutes -H "$H" -H "Content-Type: application/json" -d '{"value":1440,"category":"lead-assignment"}' | head -c 250; echo

echo
echo "=== 5) Bulk set 2 more ==="
curl -s -X POST $BASE/crm/configurations/bulk -H "$H" -H "Content-Type: application/json" -d '{"items":[{"key":"qualification.questions","value":[{"q":"Budget?","weight":20},{"q":"Timeline?","weight":15}],"category":"qualification"},{"key":"site.support-email","value":"support@langdi.local","category":"ui"}]}' | head -c 350; echo

echo
echo "=== 6) GET /configurations (list all) ==="
curl -s $BASE/crm/configurations -H "$H" | node -pe "const d=JSON.parse(require('fs').readFileSync(0,'utf8'));d.data.map(c=>'  '+c.key+' ('+c.category+'): '+JSON.stringify(c.value).substring(0,60)).join('\n')"

echo
echo "=== 7) GET /configurations?category=ui ==="
curl -s "$BASE/crm/configurations?category=ui" -H "$H" | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).data.length"
echo "  ui count"

echo
echo "=== 8) GET /configurations/:key ==="
curl -s $BASE/crm/configurations/site.theme -H "$H" | head -c 300; echo

echo
echo "=== 9) Invalid key pattern ==="
curl -s -X PUT "$BASE/crm/configurations/Bad%20Key" -H "$H" -H "Content-Type: application/json" -d '{"value":1}' | head -c 250; echo

echo
echo "=== 10) Update existing config ==="
curl -s -X PUT $BASE/crm/configurations/site.theme -H "$H" -H "Content-Type: application/json" -d '{"value":{"primaryColor":"#10B981","mode":"dark"}}' | head -c 250; echo

echo
echo "=== 11) DELETE config ==="
curl -s -X DELETE $BASE/crm/configurations/site.support-email -H "$H"; echo

echo
echo "=== 12) Trigger some audited events to populate audit log ==="
SP_ROLE=$(curl -s $BASE/crm/roles -H "$H" | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).data.find(r=>r.name==='Sales Person')._id")
NEW_USER=$(curl -s -X POST $BASE/crm/users -H "$H" -H "Content-Type: application/json" -d "{\"name\":\"Audit Test\",\"email\":\"audittest@langdi.local\",\"password\":\"Audit@12345\",\"roleId\":\"$SP_ROLE\"}")
NUID=$(echo "$NEW_USER" | EXTRACT "data.user._id")
echo "  created user: $NUID"
curl -s -X PATCH $BASE/crm/users/$NUID -H "$H" -H "Content-Type: application/json" -d '{"name":"Audit Test Updated"}' > /dev/null
curl -s -X POST $BASE/crm/users/$NUID/deactivate -H "$H" > /dev/null
curl -s -X POST $BASE/crm/users/$NUID/activate -H "$H" > /dev/null
echo "  triggered: create, update, deactivate, activate"

echo
echo "=== 13) Failed login attempt ==="
curl -s -X POST $BASE/crm/auth/login -H "Content-Type: application/json" -d '{"email":"admin@langdi.local","password":"wrong"}' > /dev/null
echo "  done (audit should capture failure)"

echo
echo "=== 14) GET /audit-logs (recent 5) ==="
curl -s "$BASE/crm/audit-logs?limit=10" -H "$H" | node -pe "const d=JSON.parse(require('fs').readFileSync(0,'utf8'));'total='+d.meta.pagination.total+'\n'+d.data.slice(0,10).map(l=>'  ['+l.createdAt.substring(11,19)+'] '+l.module+':'+l.action+' by='+((l.performedBy&&l.performedBy.name)||'system')+' success='+l.success+(l.errorMessage?' err='+l.errorMessage:'')).join('\n')"

echo
echo "=== 15) Filter audit-logs by module=user ==="
curl -s "$BASE/crm/audit-logs?module=user" -H "$H" | node -pe "const d=JSON.parse(require('fs').readFileSync(0,'utf8'));'count='+d.meta.pagination.total+'\n'+d.data.map(l=>'  '+l.action+' on '+l.refId).join('\n')"

echo
echo "=== 16) Filter audit-logs by module=auth&success=false ==="
curl -s "$BASE/crm/audit-logs?module=auth&success=false" -H "$H" | node -pe "const d=JSON.parse(require('fs').readFileSync(0,'utf8'));'failed-auth count: '+d.meta.pagination.total"

echo
echo "=== 17) Filter audit-logs by refId (specific user we created) ==="
curl -s "$BASE/crm/audit-logs?refType=user&refId=$NUID" -H "$H" | node -pe "const d=JSON.parse(require('fs').readFileSync(0,'utf8'));'actions on user '+'$NUID'+': '+d.data.map(l=>l.action).join(', ')"

echo
echo "=== 18) GET /audit-logs/:id ==="
LID=$(curl -s "$BASE/crm/audit-logs?limit=1" -H "$H" | EXTRACT "data[0]._id")
curl -s $BASE/crm/audit-logs/$LID -H "$H" | head -c 300; echo

echo
echo "=== 19) RBAC: Sales Person tries audit-logs (no auditLog:read) ==="
SLOGIN=$(curl -s -X POST $BASE/crm/auth/login -H "Content-Type: application/json" -d '{"email":"sales1@langdi.local","password":"Sales@12345"}')
SACCESS=$(echo "$SLOGIN" | EXTRACT "data.accessToken")
curl -s $BASE/crm/audit-logs -H "Authorization: Bearer $SACCESS"; echo

echo
echo "=== 20) RBAC: Sales Person tries configurations (no configuration:read) ==="
curl -s $BASE/crm/configurations -H "Authorization: Bearer $SACCESS"; echo

echo
echo "=== 21) Cleanup created user ==="
curl -s -X DELETE $BASE/crm/users/$NUID -H "$H" | head -c 150; echo

echo
echo "=== 22) Audit captured delete too ==="
curl -s "$BASE/crm/audit-logs?refType=user&refId=$NUID&limit=10" -H "$H" | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).data.map(l=>l.action).join(' -> ')"
