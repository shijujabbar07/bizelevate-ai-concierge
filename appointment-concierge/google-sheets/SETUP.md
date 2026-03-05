# Google Sheets Setup Guide

## Overview
Configure your Google Sheet to receive appointment request data from the n8n workflow.

**Estimated Time:** 5-10 minutes

---

## Your Sheet Details

- **Sheet ID**: `1hUBJx6sq3Yx60JKcBQ3yin-n1xp_Hgh0ANjEwkwPq08`
- **Sheet URL**: https://docs.google.com/spreadsheets/d/1hUBJx6sq3Yx60JKcBQ3yin-n1xp_Hgh0ANjEwkwPq08/edit

---

## Step 1: Open Your Sheet

1. Go to: https://docs.google.com/spreadsheets/d/1hUBJx6sq3Yx60JKcBQ3yin-n1xp_Hgh0ANjEwkwPq08/edit
2. Rename the first sheet tab to exactly: `Appointments`

---

## Step 2: Add Column Headers

In Row 1, add these headers (in order, columns A-I):

| Column | Header |
|--------|--------|
| A | Timestamp |
| B | Call ID |
| C | Patient Name |
| D | Phone |
| E | Requested Date/Time |
| F | Reason |
| G | Urgency |
| H | Status |
| I | Notes |

**Quick Method:** Copy the contents of `template.csv` and paste into cell A1.

---

## Step 3: Format the Sheet (Optional but Recommended)

1. **Freeze Header Row**
   - Select Row 1
   - View → Freeze → 1 row

2. **Format Columns**
   - Column A (Timestamp): Format → Number → Date time
   - Column D (Phone): Format → Number → Plain text
   - Column G (Urgency): Add data validation (routine, urgent, emergency)
   - Column H (Status): Add data validation (new, contacted, confirmed, cancelled)

3. **Add Conditional Formatting for Urgency**
   - Select Column G
   - Format → Conditional formatting
   - Add rules:
     - "emergency" → Red background
     - "urgent" → Orange background
     - "routine" → Green background

---

## Step 4: Share with n8n (If Using OAuth)

If your n8n uses a service account or different Google account:

1. Click **Share** (top right)
2. Add your n8n Google account email
3. Set permission to **Editor**
4. Click **Send**

---

## Step 5: Verify Sheet Name

The n8n workflow expects the sheet to be named exactly: **Appointments**

To rename:
1. Right-click the sheet tab at the bottom
2. Select **Rename**
3. Type: `Appointments`
4. Press Enter

---

## Column Descriptions

| Column | Description | Source |
|--------|-------------|--------|
| Timestamp | When the call was processed | n8n (auto-generated) |
| Call ID | VAPI's unique call identifier | VAPI webhook |
| Patient Name | Caller's full name | VAPI extraction |
| Phone | Caller's phone number | VAPI extraction |
| Requested Date/Time | Preferred appointment slot | VAPI extraction |
| Reason | Reason for visit | VAPI extraction |
| Urgency | AI-classified urgency level | OpenAI classification |
| Status | Current request status | Default: "new" |
| Notes | Staff notes | Manual entry |

---

## Status Workflow

Recommended status values for Column H:

1. **new** - Just received, not yet reviewed
2. **contacted** - Staff has called the patient
3. **confirmed** - Appointment confirmed
4. **cancelled** - Patient cancelled or no-show

---

## Troubleshooting

### Data Not Appearing
- Check sheet name is exactly "Appointments"
- Verify Sheet ID matches n8n configuration
- Check n8n Google Sheets credentials are valid
- Ensure sheet is shared with n8n account

### Wrong Columns
- Headers must match exactly (case-sensitive)
- No extra spaces in header names
- Headers must be in Row 1

### Permission Errors
- Re-authenticate Google Sheets in n8n
- Check sharing permissions
- Verify OAuth scopes include Sheets access

---

## Next Steps

1. [ ] Headers added to Row 1
2. [ ] Sheet renamed to "Appointments"
3. [ ] Conditional formatting applied (optional)
4. [ ] Sheet shared with n8n account (if needed)
5. [ ] Ready for testing

---

**Template File:** `template.csv`
