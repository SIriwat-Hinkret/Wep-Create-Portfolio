// Switch containers
  function showContainer(number, button) {

    for (let i = 1; i <= 4; i++) {
      document.getElementById("container" + i)
        .classList.add("hidden");
    }

    document.getElementById("container" + number)
      .classList.remove("hidden");

    document.querySelectorAll(".nav-btn")
      .forEach(btn => btn.classList.remove("active"));

    if (button && button.classList.contains("nav-btn")) {
      button.classList.add("active");
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }


  // Skills
  const skills = {
    1: [],
    2: []
  };

  function addSkill(project) {

    const input = document.getElementById("skillInput" + project);
    const skill = input.value.trim();

    if (!skill) return;

    if (skills[project].some(
      item => item.toLowerCase() === skill.toLowerCase()
    )) {
      alert("This skill has already been added.");
      return;
    }

    skills[project].push(skill);
    input.value = "";

    renderSkills(project);
  }

  function removeSkill(project, index) {
    skills[project].splice(index, 1);
    renderSkills(project);
  }

  function renderSkills(project) {

    const list = document.getElementById("skillList" + project);
    list.replaceChildren();

    skills[project].forEach((skill, index) => {

      const tag = document.createElement("span");
      tag.className = "skill-tag";

      const label = document.createTextNode(skill + " ");

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "remove-skill";
      remove.textContent = "×";
      remove.setAttribute("aria-label", "Remove " + skill);
      remove.addEventListener("click", () => {
        removeSkill(project, index);
      });

      tag.append(label, remove);
      list.appendChild(tag);
    });
  }

  // Enter key to add skills
  [1, 2].forEach(project => {
    document.getElementById("skillInput" + project)
      .addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
          event.preventDefault();
          addSkill(project);
        }
      });
  });


  // Safe HTML output
  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[char]);
  }

  // Read form values
  function getValue(form, name) {
    return form.elements.namedItem(name).value.trim();
  }


  // Build project card
  function createProjectCard(project, number) {

    const s = escapeHTML;

    return `
      <div class="col-12 col-md-6">
        <div class="project-card">

          <h3 class="project-title">${s(project.title)}</h3>

          <p><b>Type:</b> ${s(project.type)}</p>
          <p><b>Date:</b> ${s(project.date)}</p>
          <p><b>Role:</b> ${s(project.role)}</p>

          <h5 class="section-title">Description</h5>
          <p>${s(project.description)}</p>

          <h5 class="section-title">Skills</h5>
          ${project.skills.map(skill =>
            `<span class="skill-tag">${s(skill)}</span>`
          ).join("")}

          <h5 class="section-title">Reflection</h5>

          <div class="reflection-item">
            <h6>What I did</h6>
            <p>${s(project.did)}</p>
          </div>

          <div class="reflection-item">
            <h6>What I learned</h6>
            <p>${s(project.learned)}</p>
          </div>

          <div class="reflection-item">
            <h6>Challenge</h6>
            <p>${s(project.challenge)}</p>
          </div>

          <div class="reflection-item">
            <h6>Next step</h6>
            <p>${s(project.next)}</p>
          </div>

          <h5 class="section-title">Evidence</h5>
          <a href="${s(project.evidence)}"
             target="_blank"
             rel="noopener noreferrer"
             class="evidence-link">
            View Evidence ↗
          </a>

        </div>
      </div>
    `;
  }


  // Submit portfolio form
  document.getElementById("portfolio-form")
    .addEventListener("submit", function(event) {

      event.preventDefault();

      const form = this;

      // Check skills
      if (skills[1].length === 0 || skills[2].length === 0) {
        alert("Please add at least one skill to both projects.");
        return;
      }

      // Check required fields and URL format
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const user = {
        name: getValue(form, "displayName"),
        enjoy: getValue(form, "enjoy"),
        tried: getValue(form, "tried"),
        curious: getValue(form, "curious"),

        projects: [1, 2].map(number => ({
          title: getValue(form, "title" + number),
          type: getValue(form, "type" + number),
          date: getValue(form, "date" + number),
          role: getValue(form, "role" + number),
          description: getValue(form, "description" + number),
          skills: [...skills[number]],
          did: getValue(form, "did" + number),
          learned: getValue(form, "learned" + number),
          challenge: getValue(form, "challenge" + number),
          next: getValue(form, "next" + number),
          evidence: getValue(form, "evidence" + number)
        }))
      };

      // Save data
      try {
        localStorage.setItem("myPortfolio", JSON.stringify(user));
      } catch (error) {
        alert("Unable to save data in this browser.");
        return;
      }

      // Render personal portfolio
      renderPortfolio(user);

      alert("Your Portfolio has been created successfully!");

      // Go to Guest container
      showContainer(3);
    });


  // Display portfolio
  function renderPortfolio(user) {

    document.getElementById("guest-empty")
      .classList.add("hidden");

    document.getElementById("user-portfolio")
      .classList.remove("hidden");

    document.getElementById("user-name").textContent = user.name;
    document.getElementById("user-enjoy").textContent = user.enjoy;
    document.getElementById("user-tried").textContent = user.tried;
    document.getElementById("user-curious").textContent = user.curious;

    document.getElementById("user-projects").innerHTML =
      user.projects.map((project, index) =>
        createProjectCard(project, index + 1)
      ).join("");
  }


  // Restore saved portfolio
  window.addEventListener("DOMContentLoaded", function() {

    const saved = localStorage.getItem("myPortfolio");

    if (saved) {
      try {
        const user = JSON.parse(saved);

        if (
          user &&
          typeof user.name === "string" &&
          Array.isArray(user.projects) &&
          user.projects.length === 2
        ) {
          renderPortfolio(user);
        }
      } catch (error) {
        localStorage.removeItem("myPortfolio");
      }
    }

  });

