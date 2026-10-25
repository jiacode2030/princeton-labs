/* The course list. To add a course, add one entry here. Nothing else needs to change.

   id            short, unique
   title         card heading
   course        the course it follows (small line under the title)
   subject       Physics | Chemistry | Biology | Math | Computer Science  (sets the icon and the filter chip)
   description   one line
   modules       how many modules or lessons the site has (the "Y" in "X of Y"); null if unknown
   unitWord      what to call them: 'modules' (default) or 'lessons'
   topics        3 to 5 short chips
   url           where the site lives
   status        'live' or 'soon'  (soon = muted, not clickable)
   prefix        the site's localStorage prefix
   progressKey   where the site stores progress: a JSON object {id: 1} or a JSON list of ids
   progressWord  what the progress means: 'done' (default) or 'visited'
*/
window.COURSES = [
  {
    id: 'phy103',
    title: 'PHY 103 Lab',
    course: 'PHY 103: calculus-based mechanics and waves',
    subject: 'Physics',
    description: 'Every week of the course as a live simulation, with worked examples, quizzes and randomized practice.',
    modules: 32,
    unitWord: 'modules',
    topics: ['Kinematics', "Newton's laws", 'Energy and momentum', 'Rotation', 'Oscillations and waves'],
    url: 'https://jiacode2030.github.io/phy103-lab/',
    status: 'live',
    prefix: 'phy-',
    progressKey: 'phy-done',
    progressWord: 'done'
  },
  {
    id: 'mat201',
    title: 'Multivariable Calculus Lab',
    course: 'MAT 201: multivariable calculus',
    subject: 'Math',
    description: 'Surfaces you can spin and maps you can drag, from vectors and partial derivatives to Stokes’ theorem.',
    modules: 41,
    unitWord: 'lessons',
    topics: ['Vectors and space', 'Partial derivatives', 'Multiple integrals', 'Vector calculus'],
    url: 'https://jiacode2030.github.io/multivariable-calculus/',
    status: 'live',
    prefix: 'mvc-',
    progressKey: 'mvc-visited',
    progressWord: 'visited'
  },
  {
    id: 'cos126',
    title: 'COS 126 Lab',
    course: 'COS 126: computer science, an interdisciplinary approach',
    subject: 'Computer Science',
    description: 'Every lecture as a module: step through Java line by line, run a TOY machine, train a perceptron, and check yourself.',
    modules: 22,
    unitWord: 'modules',
    topics: ['Java basics', 'Recursion', 'Objects', 'Algorithms', 'TOY and circuits'],
    url: 'https://jiacode2030.github.io/cos126-lab/',
    status: 'live',
    prefix: 'cos-',
    progressKey: 'cos-done',
    progressWord: 'done'
  }
];
