# n8n Patient Identity Scoping Corrections

This document is the n8n-side source of truth for patient-facing workflows. The
live workflow must never return an unfiltered Notion database response, a first
row fallback, mock data, or cached shared patient state.

## Required Input Contract

Every patient-facing webhook must read identity from both query string and body:

```js
const query = $json.query || {};
const body = $json.body || $json;

const patient_id = String(
  query.patient_id || body.patient_id || body.patientId || ''
).trim();

const email = String(
  query.email || body.email || body.patient_email || body.patientEmail || ''
).trim().toLowerCase();
```

If both values are missing, return:

```json
{
  "success": false,
  "error": "Missing patient identity"
}
```

## fetch-patient Workflow

### Webhook Node

- Path: `fetch-patient`
- Methods to support: `GET` and `POST`
- Authentication: keep existing bearer/header gate if present
- Response mode: `Using Respond to Webhook node`
- Do not set any static response body on the Webhook node

If n8n will not allow one Webhook node to serve both `GET` and `POST`, create two
Webhook trigger nodes with the same path and different methods, then route both
into the same `Normalize Identity` node.

### Normalize Identity Code Node

Name: `Normalize Identity`

```js
const input = $input.first().json || {};
const query = input.query || {};
const body = input.body || input;

const patient_id = String(
  query.patient_id || body.patient_id || body.patientId || ''
).trim();

const email = String(
  query.email || body.email || body.patient_email || body.patientEmail || ''
).trim().toLowerCase();

if (!patient_id && !email) {
  return [{
    json: {
      success: false,
      error: 'Missing patient identity',
      statusCode: 400
    }
  }];
}

return [{
  json: {
    patient_id,
    email,
    matchBy: patient_id ? 'patient_id' : 'email'
  }
}];
```

### Early Error Branch

After `Normalize Identity`, add an IF node:

- Condition: `{{ $json.success === false }}`
- True branch: `Respond to Webhook`
- False branch: Notion query

Error response body:

```js
{{ { success: false, error: $json.error } }}
```

Set HTTP status code:

```js
{{ $json.statusCode || 400 }}
```

### Notion Query Node

Use a Notion database query that returns only exact matches.

If `matchBy` is `patient_id`, filter by exact `patient_id`:

```json
{
  "property": "patient_id",
  "rich_text": {
    "equals": "={{ $json.patient_id }}"
  }
}
```

If the Notion `patient_id` property is a different type, use the matching exact
operator for that type:

- Title: `title.equals`
- Rich text / Text: `rich_text.equals`
- Email: `email.equals`
- Number: `number.equals` after converting the incoming value to a number

If `matchBy` is `email`, filter by exact normalized email:

```json
{
  "property": "email",
  "email": {
    "equals": "={{ $json.email }}"
  }
}
```

If the Notion email property is plain text instead of Email type, use:

```json
{
  "property": "email",
  "rich_text": {
    "equals": "={{ $json.email }}"
  }
}
```

Important: do not query all rows and filter later unless the Notion node cannot
express the property type. If a later Code node is unavoidable, it must still
reject zero and multiple matches and must never pick index `0` as a fallback.

### Validate Match Count Code Node

Name: `Validate Single Patient`

```js
const rows = $input.all().map((item) => item.json);

if (rows.length === 0) {
  return [{
    json: {
      success: false,
      error: 'Patient not found',
      statusCode: 404
    }
  }];
}

if (rows.length > 1) {
  return [{
    json: {
      success: false,
      error: 'Multiple patient records found',
      statusCode: 409
    }
  }];
}

return [{
  json: {
    success: true,
    patient: rows[0],
    statusCode: 200
  }
}];
```

### Respond to Webhook Node

Response body:

```js
{{
  $json.success
    ? { success: true, patient: $json.patient }
    : { success: false, error: $json.error }
}}
```

HTTP status code:

```js
{{ $json.statusCode || ($json.success ? 200 : 400) }}
```

## Other Patient-Facing Workflows

Apply the same `Normalize Identity` pattern and exact Notion filtering to:

- `patient-reports` / reports
- `patient-diet` / diet
- dispatch/order workflows
- payment workflows
- `patient/report/upload` / uploads
- follow-up workflows

Rules for these workflows:

- Read `patient_id` and `email` from query string, JSON body, or multipart body.
- Prefer exact `patient_id` filter when present.
- Fall back to exact normalized email only when `patient_id` is missing.
- Reject missing identity with `success: false`.
- Reject zero patient matches with a clear not-found error.
- Reject multiple patient matches with a clear duplicate-record error.
- For child data such as reports, uploads, payments, medicines, dispatches, or
  follow-ups, query by exact `patient_id` or an exact relation to the validated
  patient page ID.
- Do not return raw Notion query results that include rows belonging to other
  patients.
- Do not use static data, shared workflow static data, or global variables for
  current patient state.

## Verification Requests

After publishing the n8n changes, these checks should pass:

```powershell
Invoke-WebRequest `
  -Uri "https://n8n.curiyawellness.com/webhook/fetch-patient?patient_id=__NO_SUCH_PATIENT__&email=no-such@example.invalid" `
  -Headers @{ Authorization = "Bearer <secret>" } `
  -Method GET
```

Expected body:

```json
{
  "success": false,
  "error": "Patient not found"
}
```

```powershell
$body = @{ patient_id = "__NO_SUCH_PATIENT__"; email = "no-such@example.invalid" } | ConvertTo-Json
Invoke-WebRequest `
  -Uri "https://n8n.curiyawellness.com/webhook/fetch-patient" `
  -Headers @{ Authorization = "Bearer <secret>"; "Content-Type" = "application/json" } `
  -Method POST `
  -Body $body
```

Expected body:

```json
{
  "success": false,
  "error": "Patient not found"
}
```

For a real patient identity, the expected body is:

```json
{
  "success": true,
  "patient": {}
}
```

The `patient` object must be the single Notion row that exactly matches the
requested `patient_id`, or the requested email when `patient_id` is absent.
