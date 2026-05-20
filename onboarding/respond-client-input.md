# CustomerReach Respond - Client Input

> Copy this file, fill in every field, paste to Claude, and say:
> **"Onboard this client for CustomerReach Respond."**

---

## Client Details

```
Client Name:          [e.g. Acme Dental]
Client ID:            [e.g. acme-dental - lowercase, hyphens, no spaces]
Industry:             [e.g. dental / physio / chiro / medical / other]
```

## Contact & Notifications

```
Owner/Front-Desk Mobile:   [E.164 format, e.g. +61412345678]
  (This receives the missed-call alert SMS alongside the patient)
```

## Booking Link

```
Booking Page URL:     [Full URL, e.g. https://calendly.com/acme-dental/booking]
  (Leave blank if none - patient SMS will say "Reply BOOK and we'll call you back")
```

## Business Hours

```
Open from:    [e.g. 8]    (24hr, e.g. 8 = 8am)
Close at:     [e.g. 18]   (24hr, e.g. 18 = 6pm)
Open days:    [e.g. Mon-Fri / Mon-Sat / Mon-Sun]
Timezone:     [e.g. Australia/Sydney / Australia/Melbourne / Australia/Brisbane / Australia/Perth]
```

## Twilio Number

```
Twilio AU Number:     [E.164 format, e.g. +61485123456]
  (The number purchased in Phase A - Step 1)

Phone Setup Option:
  [ ] Option 1 - Dedicated second number (new number, existing line untouched)
  [ ] Option 2 - Conditional forward from existing number (fill in existing number below)
  [ ] Option 3 - Number porting (allow 5-15 business days)

Existing Clinic Number (Option 2 only):   [e.g. 03 9123 4567]
```

## Dashboard Access (Optional)

```
Staff email 1:   [email@example.com]
Staff email 2:   [email@example.com or leave blank]
Staff email 3:   [email@example.com or leave blank]
```

---

## Example - Completed

```
Client Name:          Acme Dental Campsie
Client ID:            acme-dental
Industry:             dental

Owner/Front-Desk Mobile:   +61412987654

Booking Page URL:     https://calendly.com/acme-dental/new-patient

Open from:    8
Close at:     17
Open days:    Mon-Fri
Timezone:     Australia/Sydney

Twilio AU Number:     +61485234567

Phone Setup Option:
  [x] Option 1 - Dedicated second number

Staff email 1:   reception@acmedental.com.au
Staff email 2:
```
