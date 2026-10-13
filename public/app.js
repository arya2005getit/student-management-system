const studentList = document.querySelector("#student-list");
const studentDialog = document.querySelector("#student-dialog");
const studentForm = document.querySelector("#student-form");
const notice = document.querySelector("#notice");
const searchInput = document.querySelector("#search-input");

let students = [];
let editingStudentId = null;

const avatarColors = [
  ["#f1efff", "#7763df"],
  ["#eaf7f2", "#4ba681"],
  ["#fff4e8", "#d18b41"],
  ["#eaf3ff", "#5683c8"],
  ["#fdeef2", "#cd718b"]
];

function showNotice(message, type = "success") {
  notice.textContent = message;
  notice.className = `notice ${type}`;
  notice.hidden = false;
  window.setTimeout(() => { notice.hidden = true; }, 4500);
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers }
  });
  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) {
    throw new Error(data?.message || "The request could not be completed.");
  }
  return data;
}

function initials(name) {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function renderStudents() {
  const query = searchInput.value.trim().toLowerCase();
  const visibleStudents = students.filter((student) =>
    [student.name, student.email, student.course].some((value) => value.toLowerCase().includes(query))
  );

  document.querySelector("#total-count").textContent = students.length;
  document.querySelector("#nav-count").textContent = students.length;
  document.querySelector("#results-label").textContent =
    `Showing ${visibleStudents.length} ${visibleStudents.length === 1 ? "student" : "students"}`;

  if (visibleStudents.length === 0) {
    studentList.innerHTML = `<tr><td class="empty-row" colspan="5">${
      students.length ? "No students match your search." : "No students yet. Add your first student to get started!"
    }</td></tr>`;
    return;
  }

  studentList.innerHTML = visibleStudents.map((student, index) => {
    const [background, foreground] = avatarColors[index % avatarColors.length];
    return `
      <tr>
        <td><div class="student-person"><span class="student-avatar" style="background:${background};color:${foreground}">${initials(student.name)}</span>${escapeHtml(student.name)}</div></td>
        <td>${escapeHtml(student.course)}</td>
        <td><span class="year-pill">Year ${student.year}</span></td>
        <td>${escapeHtml(student.email)}</td>
        <td class="row-actions">
          <button class="icon-button edit-student" type="button" data-id="${student._id}" aria-label="Edit ${escapeHtml(student.name)}">✎</button>
          <button class="icon-button delete-student" type="button" data-id="${student._id}" aria-label="Delete ${escapeHtml(student.name)}">⌫</button>
        </td>
      </tr>`;
  }).join("");
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[character]);
}

async function loadStudents() {
  studentList.innerHTML = '<tr><td class="loading-row" colspan="5">Loading students...</td></tr>';
  try {
    students = await request("/api/students");
    renderStudents();
  } catch (error) {
    studentList.innerHTML = `<tr><td class="empty-row" colspan="5">${escapeHtml(error.message)}</td></tr>`;
    showNotice(error.message, "error");
  }
}

function openStudentDialog(student = null) {
  editingStudentId = student?._id || null;
  studentForm.reset();
  document.querySelector("#form-error").textContent = "";
  document.querySelector("#dialog-title").textContent = student ? "Edit student" : "Add a student";
  document.querySelector("#save-button").textContent = student ? "Save changes" : "Save student";
  if (student) {
    for (const field of ["name", "email", "course", "year"]) {
      studentForm.elements[field].value = student[field];
    }
  }
  studentDialog.showModal();
  studentForm.elements.name.focus();
}

document.querySelector("#add-student-button").addEventListener("click", () => openStudentDialog());
document.querySelector("#close-dialog").addEventListener("click", () => studentDialog.close());
document.querySelector("#cancel-dialog").addEventListener("click", () => studentDialog.close());
searchInput.addEventListener("input", renderStudents);

studentForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(studentForm);
  const student = Object.fromEntries(formData.entries());
  student.year = Number(student.year);
  const saveButton = document.querySelector("#save-button");
  saveButton.disabled = true;
  document.querySelector("#form-error").textContent = "";

  try {
    await request(editingStudentId ? `/api/students/${editingStudentId}` : "/api/students", {
      method: editingStudentId ? "PATCH" : "POST",
      body: JSON.stringify(student)
    });
    studentDialog.close();
    showNotice(editingStudentId ? "Student details updated." : "Student added successfully.");
    await loadStudents();
  } catch (error) {
    document.querySelector("#form-error").textContent = error.message;
  } finally {
    saveButton.disabled = false;
  }
});

studentList.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-id]");
  if (!button) return;
  const student = students.find((item) => item._id === button.dataset.id);
  if (button.classList.contains("edit-student")) {
    openStudentDialog(student);
    return;
  }

  if (button.classList.contains("delete-student") &&
      window.confirm(`Delete ${student.name} from the student directory?`)) {
    try {
      await request(`/api/students/${student._id}`, { method: "DELETE" });
      showNotice("Student deleted successfully.");
      await loadStudents();
    } catch (error) {
      showNotice(error.message, "error");
    }
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
    event.preventDefault();
    searchInput.focus();
  }
});

loadStudents();
