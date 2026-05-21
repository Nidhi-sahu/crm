#!/bin/bash
set -e
BASE=http://localhost:5000/api/v1

EXTRACT() { node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).$1" 2>/dev/null; }

LOGIN=$(curl -s -X POST $BASE/crm/auth/login -H "Content-Type: application/json" -d '{"email":"admin@langdi.local","password":"Admin@12345"}')
ACCESS=$(echo "$LOGIN" | EXTRACT "data.accessToken")
H="Authorization: Bearer $ACCESS"
echo "admin login OK"

S1_ID=$(curl -s "$BASE/crm/users?search=sales1" -H "$H" | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).data[0]._id")
echo "sales1 id: $S1_ID"

make_lead() {
  local E=$(curl -s -X POST $BASE/crm/enquiries -H "$H" -H "Content-Type: application/json" -d "{\"clientName\":\"$1\",\"clientPhone\":\"$2\",\"source\":\"website\"}")
  local EID=$(echo "$E" | EXTRACT "data.enquiry._id")
  local Q=$(curl -s -X POST $BASE/crm/qualifications -H "$H" -H "Content-Type: application/json" -d "{\"enquiryId\":\"$EID\",\"score\":80}")
  curl -s -X POST $BASE/crm/qualifications/$(echo "$Q" | EXTRACT "data.qualification._id")/qualify -H "$H" > /dev/null
  local L=$(curl -s -X POST $BASE/crm/leads/from-enquiry/$EID -H "$H")
  echo "$L" | EXTRACT "data.lead._id"
}

echo
echo "=== 1) Create lead + add comment ==="
LID=$(make_lead "Comment Test" "9300000001")
echo "lead: $LID"
C1=$(curl -s -X POST $BASE/crm/comments -H "$H" -H "Content-Type: application/json" -d "{\"referenceType\":\"lead\",\"referenceId\":\"$LID\",\"comment\":\"Initial contact made.\",\"nextFollowupDate\":\"2026-05-19\",\"nextFollowupTime\":\"14:00\"}")
echo "$C1" | head -c 280; echo

echo
echo "=== 2) Add 2 more comments ==="
curl -s -X POST $BASE/crm/comments -H "$H" -H "Content-Type: application/json" -d "{\"referenceType\":\"lead\",\"referenceId\":\"$LID\",\"comment\":\"Sent PDF\"}" > /dev/null
curl -s -X POST $BASE/crm/comments -H "$H" -H "Content-Type: application/json" -d "{\"referenceType\":\"lead\",\"referenceId\":\"$LID\",\"comment\":\"Visit scheduled\"}" > /dev/null
echo "3 comments total"

echo
echo "=== 3) GET /comments/by-ref/lead/:id ==="
curl -s $BASE/crm/comments/by-ref/lead/$LID -H "$H" | node -pe "const d=JSON.parse(require('fs').readFileSync(0,'utf8'));d.data.length+' comments: '+d.data.map(c=>c.comment.substring(0,30)).join(' | ')"

echo
echo "=== 4) Bad reference id ==="
curl -s -X POST $BASE/crm/comments -H "$H" -H "Content-Type: application/json" -d "{\"referenceType\":\"lead\",\"referenceId\":\"507f1f77bcf86cd799439011\",\"comment\":\"x\"}"; echo

echo
echo "=== 5) Reminder due in 1h ==="
NOW_PLUS_1H=$(node -pe "new Date(Date.now()+3600000).toISOString()")
R1=$(curl -s -X POST $BASE/crm/reminders -H "$H" -H "Content-Type: application/json" -d "{\"referenceType\":\"lead\",\"referenceId\":\"$LID\",\"assignedTo\":\"$S1_ID\",\"title\":\"Call client\",\"reminderDate\":\"$NOW_PLUS_1H\",\"reminderTime\":\"15:00\"}")
RID1=$(echo "$R1" | EXTRACT "data.reminder._id")
echo "R1: $RID1"

echo
echo "=== 6) OVERDUE reminder (1h ago) ==="
PAST=$(node -pe "new Date(Date.now()-3600000).toISOString()")
R2=$(curl -s -X POST $BASE/crm/reminders -H "$H" -H "Content-Type: application/json" -d "{\"referenceType\":\"lead\",\"referenceId\":\"$LID\",\"assignedTo\":\"$S1_ID\",\"title\":\"OVERDUE site visit\",\"reminderDate\":\"$PAST\"}")
RID2=$(echo "$R2" | EXTRACT "data.reminder._id")
echo "R2 (overdue): $RID2"

echo
echo "=== 7) TODAY reminder ==="
TODAY=$(node -pe "var d=new Date();d.setHours(20,0,0,0);d.toISOString()")
R3=$(curl -s -X POST $BASE/crm/reminders -H "$H" -H "Content-Type: application/json" -d "{\"referenceType\":\"lead\",\"referenceId\":\"$LID\",\"assignedTo\":\"$S1_ID\",\"title\":\"Today 8PM\",\"reminderDate\":\"$TODAY\"}")
RID3=$(echo "$R3" | EXTRACT "data.reminder._id")
echo "R3: $RID3"

echo
echo "=== 8) sales1 login ==="
SLOGIN=$(curl -s -X POST $BASE/crm/auth/login -H "Content-Type: application/json" -d '{"email":"sales1@langdi.local","password":"Sales@12345"}')
SACCESS=$(echo "$SLOGIN" | EXTRACT "data.accessToken")
SH="Authorization: Bearer $SACCESS"

echo
echo "=== 9) GET /reminders/today ==="
curl -s $BASE/crm/reminders/today -H "$SH" | EXTRACT "meta.pagination.total"

echo
echo "=== 10) GET /reminders/overdue ==="
curl -s $BASE/crm/reminders/overdue -H "$SH" | EXTRACT "meta.pagination.total"

echo
echo "=== 11) sales1 completes R1 ==="
curl -s -X POST $BASE/crm/reminders/$RID1/complete -H "$SH" | head -c 250; echo

echo
echo "=== 12) Re-complete already done (fail) ==="
curl -s -X POST $BASE/crm/reminders/$RID1/complete -H "$SH"; echo

echo
echo "=== 13) sales1 notifications list ==="
curl -s $BASE/crm/notifications -H "$SH" | node -pe "const d=JSON.parse(require('fs').readFileSync(0,'utf8'));'total='+d.meta.pagination.total+' unread='+d.meta.unread+' types=['+d.data.slice(0,5).map(n=>n.type).join(',')+']'"

echo
echo "=== 14) unread count ==="
curl -s $BASE/crm/notifications/unread-count -H "$SH" | EXTRACT "data.count"

echo
echo "=== 15) Assign new lead → expect notification fired ==="
LID_NEW=$(make_lead "Notif Trigger" "9300000002")
BEFORE=$(curl -s $BASE/crm/notifications/unread-count -H "$SH" | EXTRACT "data.count")
curl -s -X POST $BASE/crm/leads/$LID_NEW/assign -H "$H" -H "Content-Type: application/json" -d "{\"assignedTo\":\"$S1_ID\",\"reason\":\"test\"}" > /dev/null
sleep 1
AFTER=$(curl -s $BASE/crm/notifications/unread-count -H "$SH" | EXTRACT "data.count")
echo "before=$BEFORE after=$AFTER"

echo
echo "=== 16) Latest notif ==="
curl -s "$BASE/crm/notifications?limit=1" -H "$SH" | node -pe "const n=JSON.parse(require('fs').readFileSync(0,'utf8')).data[0];n.type+' | '+n.title+' | '+n.body"

echo
echo "=== 17) Mark first read ==="
NID=$(curl -s "$BASE/crm/notifications?limit=1" -H "$SH" | EXTRACT "data[0]._id")
curl -s -X POST $BASE/crm/notifications/$NID/mark-read -H "$SH" | head -c 180; echo

echo
echo "=== 18) Stage move → notif to assignee ==="
S2=$(curl -s $BASE/crm/lead-stages -H "$H" | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).data.find(s=>s.order===2)._id")
BEFORE=$(curl -s $BASE/crm/notifications/unread-count -H "$SH" | EXTRACT "data.count")
curl -s -X POST $BASE/crm/leads/$LID_NEW/move-stage -H "$H" -H "Content-Type: application/json" -d "{\"toStageId\":\"$S2\"}" > /dev/null
sleep 1
AFTER=$(curl -s $BASE/crm/notifications/unread-count -H "$SH" | EXTRACT "data.count")
echo "before=$BEFORE after=$AFTER"

echo
echo "=== 19) Mark all read ==="
curl -s -X POST $BASE/crm/notifications/mark-all-read -H "$SH" | head -c 180; echo
echo "unread now: $(curl -s $BASE/crm/notifications/unread-count -H \"$SH\" | EXTRACT data.count)"

echo
echo "=== 20) Trigger overdue cron via direct job run ==="
node test_run_overdue.js 2>&1 | tail -5

echo
echo "=== 21) R2 status now 'missed' ==="
curl -s $BASE/crm/reminders/$RID2 -H "$H" | EXTRACT "data.reminder.status"

echo
echo "=== 22) sales1 has reminder_overdue notification ==="
curl -s "$BASE/crm/notifications?type=reminder_overdue&limit=1" -H "$SH" | node -pe "const d=JSON.parse(require('fs').readFileSync(0,'utf8'));d.data.length?(d.data[0].title+' — '+d.data[0].body):'(none)'"

echo
echo "=== 23) Delete own comment ==="
CID=$(echo "$C1" | EXTRACT "data.comment._id")
curl -s -X DELETE $BASE/crm/comments/$CID -H "$H" | head -c 180; echo

echo
echo "=== 24) Validation: missing comment ==="
curl -s -X POST $BASE/crm/comments -H "$H" -H "Content-Type: application/json" -d "{\"referenceType\":\"lead\",\"referenceId\":\"$LID\"}" | head -c 250; echo
