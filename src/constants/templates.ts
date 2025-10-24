export interface NoteTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  content: string;
}

export const NOTE_TEMPLATES: NoteTemplate[] = [
  {
    id: 'blank',
    name: 'Blank Note',
    icon: 'Description',
    description: 'Start with an empty note',
    content: ''
  },
  {
    id: 'meeting-notes',
    name: 'Meeting Notes',
    icon: 'EditNote',
    description: 'Template for meeting notes',
    content: `<h2>Meeting Notes</h2>

<h3>Date & Time</h3>
<p>[Date and time]</p>

<h3>Attendees</h3>
<ul>
  <li>[Name 1]</li>
  <li>[Name 2]</li>
  <li>[Name 3]</li>
</ul>

<h3>Agenda</h3>
<ol>
  <li>[Topic 1]</li>
  <li>[Topic 2]</li>
  <li>[Topic 3]</li>
</ol>

<h3>Discussion Points</h3>
<p>[Key points discussed...]</p>

<h3>Action Items</h3>
<ul>
  <li>[ ] [Action item 1] - Assigned to: [Name]</li>
  <li>[ ] [Action item 2] - Assigned to: [Name]</li>
  <li>[ ] [Action item 3] - Assigned to: [Name]</li>
</ul>

<h3>Next Steps</h3>
<p>[What happens next...]</p>

<h3>Next Meeting</h3>
<p>[Date and time of next meeting]</p>`
  },
  {
    id: 'todo-list',
    name: 'To-Do List',
    icon: 'CheckBox',
    description: 'Simple checklist template',
    content: `<h2>To-Do List</h2>

<h3>Priority Tasks</h3>
<ul>
  <li>[ ] [High priority task 1]</li>
  <li>[ ] [High priority task 2]</li>
  <li>[ ] [High priority task 3]</li>
</ul>

<h3>Today</h3>
<ul>
  <li>[ ] [Task 1]</li>
  <li>[ ] [Task 2]</li>
  <li>[ ] [Task 3]</li>
  <li>[ ] [Task 4]</li>
</ul>

<h3>This Week</h3>
<ul>
  <li>[ ] [Task 1]</li>
  <li>[ ] [Task 2]</li>
  <li>[ ] [Task 3]</li>
</ul>

<h3>Completed</h3>
<ul>
  <li>[x] [Completed task 1]</li>
  <li>[x] [Completed task 2]</li>
</ul>`
  },
  {
    id: 'research-note',
    name: 'Research Note',
    icon: 'Science',
    description: 'Template for research and study notes',
    content: `<h2>Research Note</h2>

<h3>Topic</h3>
<p>[Main research topic]</p>

<h3>Source</h3>
<p>[Book, article, website, etc.]</p>

<h3>Key Concepts</h3>
<ul>
  <li><strong>Concept 1:</strong> [Description]</li>
  <li><strong>Concept 2:</strong> [Description]</li>
  <li><strong>Concept 3:</strong> [Description]</li>
</ul>

<h3>Important Quotes</h3>
<blockquote>
  <p>"[Quote 1]"</p>
  <cite>— [Author/Source]</cite>
</blockquote>

<blockquote>
  <p>"[Quote 2]"</p>
  <cite>— [Author/Source]</cite>
</blockquote>

<h3>Summary</h3>
<p>[Brief summary of findings...]</p>

<h3>Questions</h3>
<ul>
  <li>[Question 1]</li>
  <li>[Question 2]</li>
  <li>[Question 3]</li>
</ul>

<h3>Related Resources</h3>
<ul>
  <li><a href="#">[Resource 1]</a></li>
  <li><a href="#">[Resource 2]</a></li>
</ul>`
  },
  {
    id: 'project-plan',
    name: 'Project Plan',
    icon: 'Analytics',
    description: 'Template for project planning',
    content: `<h2>Project Plan</h2>

<h3>Project Name</h3>
<p>[Project name]</p>

<h3>Objective</h3>
<p>[What are we trying to achieve?]</p>

<h3>Scope</h3>
<p><strong>In Scope:</strong></p>
<ul>
  <li>[Item 1]</li>
  <li>[Item 2]</li>
</ul>

<p><strong>Out of Scope:</strong></p>
<ul>
  <li>[Item 1]</li>
  <li>[Item 2]</li>
</ul>

<h3>Timeline</h3>
<ul>
  <li><strong>Phase 1:</strong> [Dates] - [Description]</li>
  <li><strong>Phase 2:</strong> [Dates] - [Description]</li>
  <li><strong>Phase 3:</strong> [Dates] - [Description]</li>
</ul>

<h3>Team Members</h3>
<ul>
  <li><strong>[Name 1]</strong> - [Role]</li>
  <li><strong>[Name 2]</strong> - [Role]</li>
  <li><strong>[Name 3]</strong> - [Role]</li>
</ul>

<h3>Deliverables</h3>
<ol>
  <li>[Deliverable 1]</li>
  <li>[Deliverable 2]</li>
  <li>[Deliverable 3]</li>
</ol>

<h3>Risks & Mitigation</h3>
<ul>
  <li><strong>Risk 1:</strong> [Mitigation strategy]</li>
  <li><strong>Risk 2:</strong> [Mitigation strategy]</li>
</ul>`
  },
  {
    id: 'daily-journal',
    name: 'Daily Journal',
    icon: 'Book',
    description: 'Template for daily journaling',
    content: `<h2>Daily Journal</h2>

<h3>Date</h3>
<p>[Date]</p>

<h3>Mood</h3>
<p>[How are you feeling today?]</p>

<h3>Gratitude</h3>
<p>Today I'm grateful for:</p>
<ul>
  <li>[Thing 1]</li>
  <li>[Thing 2]</li>
  <li>[Thing 3]</li>
</ul>

<h3>Today's Highlights</h3>
<p>[What were the best moments of the day?]</p>

<h3>Challenges</h3>
<p>[What challenges did you face?]</p>

<h3>Lessons Learned</h3>
<p>[What did you learn today?]</p>

<h3>Tomorrow's Goals</h3>
<ul>
  <li>[Goal 1]</li>
  <li>[Goal 2]</li>
  <li>[Goal 3]</li>
</ul>

<h3>Notes</h3>
<p>[Any other thoughts...]</p>`
  },
  {
    id: 'recipe',
    name: 'Recipe',
    icon: 'Restaurant',
    description: 'Template for cooking recipes',
    content: `<h2>Recipe: [Recipe Name]</h2>

<h3>Details</h3>
<ul>
  <li><strong>Prep Time:</strong> [time]</li>
  <li><strong>Cook Time:</strong> [time]</li>
  <li><strong>Servings:</strong> [number]</li>
  <li><strong>Difficulty:</strong> [Easy/Medium/Hard]</li>
</ul>

<h3>Ingredients</h3>
<ul>
  <li>[Quantity] [Ingredient 1]</li>
  <li>[Quantity] [Ingredient 2]</li>
  <li>[Quantity] [Ingredient 3]</li>
  <li>[Quantity] [Ingredient 4]</li>
</ul>

<h3>Instructions</h3>
<ol>
  <li>[Step 1]</li>
  <li>[Step 2]</li>
  <li>[Step 3]</li>
  <li>[Step 4]</li>
</ol>

<h3>Tips</h3>
<ul>
  <li>[Tip 1]</li>
  <li>[Tip 2]</li>
</ul>

<h3>Notes</h3>
<p>[Any additional notes or variations...]</p>`
  }
];

export function getTemplateById(id: string): NoteTemplate | undefined {
  return NOTE_TEMPLATES.find(template => template.id === id);
}

export function getTemplateContent(id: string): string {
  const template = getTemplateById(id);
  return template ? template.content : '';
}
