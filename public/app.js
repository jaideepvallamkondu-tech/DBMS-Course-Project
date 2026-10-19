let SCHEMA = {};
let currentKey = null;

const tableNav = document.getElementById("tableNav");
const recordForm = document.getElementById("recordForm");
const formTitle = document.getElementById("formTitle");
const tableTitle = document.getElementById("tableTitle");
const statusMsg = document.getElementById("statusMsg");
const tableHead = document.getElementById("tableHead");
const tableBody = document.getElementById("tableBody");

async function init() {
  const res = await fetch("/api/schema");
  SCHEMA = await res.json();

  Object.keys(SCHEMA).forEach((key) => {
    const btn = document.createElement("button");
    btn.className = "nav-btn";
    btn.textContent = SCHEMA[key].label;
    btn.dataset.key = key;
    btn.addEventListener("click", () => selectTable(key));
    tableNav.appendChild(btn);
  });

  const firstKey = Object.keys(SCHEMA)[0];
  if (firstKey) selectTable(firstKey);
}

async function selectTable(key) {
  currentKey = key;
  [...tableNav.children].forEach((b) => b.classList.toggle("active", b.dataset.key === key));

  const cfg = SCHEMA[key];
  formTitle.textContent = `Add New ${cfg.label} Record`;
  tableTitle.textContent = `Existing ${cfg.label} Records`;
  statusMsg.textContent = "";
  statusMsg.className = "status-msg";

  await buildForm(cfg);
  await loadRows();
}

async function buildForm(cfg) {
  recordForm.innerHTML = "";

  for (const col of cfg.columns) {
    const wrap = document.createElement("div");
    wrap.className = "field";

    const label = document.createElement("label");
    label.textContent = col.label + (col.required ? " *" : "");
    wrap.appendChild(label);

    let input;
    if (col.type === "select") {
      input = document.createElement("select");
      const blank = document.createElement("option");
      blank.value = "";
      blank.textContent = "-- select --";
      input.appendChild(blank);
      col.options.forEach((opt) => {
        const o = document.createElement("option");
        o.value = opt;
        o.textContent = opt;
        input.appendChild(o);
      });
    } else if (col.type === "fk") {
      input = document.createElement("select");
      const blank = document.createElement("option");
      blank.value = "";
      blank.textContent = "-- select --";
      input.appendChild(blank);
      const refRows = await fetchRows(col.refTable);
      const refCfg = SCHEMA[col.refTable];
      refRows.forEach((row) => {
        const o = document.createElement("option");
        o.value = row[refCfg.pk];
        o.textContent = `${row[refCfg.pk]} — ${row[col.refLabel]}`;
        input.appendChild(o);
      });
    } else {
      input = document.createElement("input");
      input.type = col.type === "number" ? "number" : col.type;
    }

    input.name = col.name;
    if (col.required) input.required = true;
    wrap.appendChild(input);
    recordForm.appendChild(wrap);
  }

  const submitBtn = document.createElement("button");
  submitBtn.type = "submit";
  submitBtn.className = "btn btn-primary";
  submitBtn.textContent = `Insert ${cfg.label}`;
  recordForm.appendChild(submitBtn);
}

async function fetchRows(key) {
  const res = await fetch(`/api/${key}`);
  if (!res.ok) return [];
  return res.json();
}

async function loadRows() {
  const cfg = SCHEMA[currentKey];
  const rows = await fetchRows(currentKey);

  const columns = [cfg.pk, ...cfg.columns.map((c) => c.name), "__actions"];
  tableHead.innerHTML = "";
  columns.forEach((c) => {
    const th = document.createElement("th");
    th.textContent = c === "__actions" ? "" : c;
    tableHead.appendChild(th);
  });

  tableBody.innerHTML = "";
  if (rows.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = columns.length;
    td.textContent = "No records yet.";
    td.style.color = "#5B7370";
    tr.appendChild(td);
    tableBody.appendChild(tr);
    return;
  }

  rows.forEach((row) => {
    const tr = document.createElement("tr");
    columns.forEach((c) => {
      const td = document.createElement("td");
      if (c === "__actions") {
        const delBtn = document.createElement("button");
        delBtn.className = "btn-delete";
        delBtn.textContent = "Delete";
        delBtn.addEventListener("click", () => deleteRow(row[cfg.pk]));
        td.appendChild(delBtn);
      } else {
        const v = row[c];
        td.textContent = v === null || v === undefined ? "" : String(v);
      }
      tr.appendChild(td);
    });
    tableBody.appendChild(tr);
  });
}

recordForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(recordForm);
  const payload = Object.fromEntries(formData.entries());

  try {
    const res = await fetch(`/api/${currentKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Insert failed");

    statusMsg.textContent = "Record inserted successfully.";
    statusMsg.className = "status-msg success";
    recordForm.reset();
    await loadRows();
  } catch (err) {
    statusMsg.textContent = err.message;
    statusMsg.className = "status-msg error";
  }
});

async function deleteRow(id) {
  if (!confirm("Delete this record?")) return;
  try {
    const res = await fetch(`/api/${currentKey}/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Delete failed");

    statusMsg.textContent = "Record deleted successfully.";
    statusMsg.className = "status-msg success";
    await loadRows();
  } catch (err) {
    statusMsg.textContent = err.message;
    statusMsg.className = "status-msg error";
  }
}

init();
