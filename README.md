# Majestique Colours Cricket League 2027 — Player Registration

A mobile-friendly registration form for the player auction (6–7 Feb 2027), with **separate forms for boys and girls**.

| Link | Opens |
|---|---|
| `https://<your-site>/boys` | Boys' form (same as `/?for=boys`) |
| `https://<your-site>/girls` | Girls' form (same as `/?for=girls`) |
| `https://<your-site>/` | A page asking "Boys or Girls?" |
It needs no server and no fees. Each submission becomes one row in a Google Sheet, and you can download that sheet as Excel (.xlsx) whenever you want.

## Files

| File | What it is |
|---|---|
| `index.html` | The page |
| `style.css` | Styling |
| `app.js` | Validation, jersey preview, submit |
| `config.js` | **Paste your Google Script URL here** |
| `apps-script/Code.gs` | Code that receives registrations into the Google Sheet |
| `assets/` | Logos, resized for the web |

## Connect the form to a sheet (one time, about 5 minutes)

1. Create a new Google Sheet, for example "CCL 2027 Registrations".
2. In the sheet, open **Extensions → Apps Script**. Delete what's there, paste in the contents of `apps-script/Code.gs`, and save.
3. Click **Deploy → New deployment**. For the type, choose **Web app**. Set **Execute as: Me** and **Who has access: Anyone**, then click **Deploy** and approve the permissions.
4. Copy the **Web app URL** (it ends in `/exec`) into `config.js` as `SCRIPT_URL`.
5. In the Apps Script editor, pick **setup** in the function dropdown and click **Run**. This creates the **Boys** and **Girls** tabs with header rows.
6. Submit one test registration on each form. Each should appear as a row in its own tab.
7. Before going live, delete the test rows. Numbering restarts from 0001.

If you later edit `Code.gs`, redeploy through **Deploy → Manage deployments → Edit → New version**. This keeps the same URL.

To get the Excel file, open the sheet and choose **File → Download → Microsoft Excel (.xlsx)**.

## Behaviour

- Boys' registrations go to the **Boys** tab, girls' to the **Girls** tab.
- Each registration gets an ID: `CCL27-B-0001` for boys, `CCL27-G-0001` for girls.
- Each WhatsApp number can register only once (checked across both tabs).
- The live jersey preview shows the typed name and number; the size chart (S–3XL, chest and length in inches) sits under the size picker.
- Queries contact on the page: Rohit Jethale, 93733 13346.
- The sheet adds an "Age on 6 Feb 2027" column automatically.
- Until `SCRIPT_URL` is set, the form runs in **demo mode**: it shows the success screen but saves nothing.
