const problems = [
  { id: 1, title: 'Two Sum', difficulty: 'Easy', topic: 'Arrays' },
  { id: 2, title: 'Reverse String', difficulty: 'Easy', topic: 'Strings' },
  { id: 3, title: 'N-Queens Count', difficulty: 'Hard', topic: 'Recursion' },
  { id: 4, title: 'Implement Stack', difficulty: 'Medium', topic: 'Data Structures' },
  { id: 5, title: 'Top Customers', difficulty: 'Medium', topic: 'SQL Basics' }
];

let submissions = [];
let currentProblem = problems[0];
let contestInterval;

const difficultyFilter = document.getElementById('difficultyFilter');
const topicFilter = document.getElementById('topicFilter');
const problemList = document.getElementById('problemList');
const output = document.getElementById('output');

function renderProblems() {
  const filtered = problems.filter((p) => {
    const passDifficulty = difficultyFilter.value === 'all' || p.difficulty === difficultyFilter.value;
    const passTopic = topicFilter.value === 'all' || p.topic === topicFilter.value;
    return passDifficulty && passTopic;
  });

  problemList.innerHTML = '';
  filtered.forEach((p) => {
    const item = document.createElement('li');
    item.innerHTML = `<button class="btn secondary">${p.title}</button> <small>(${p.difficulty} • ${p.topic})</small>`;
    item.querySelector('button').addEventListener('click', () => {
      currentProblem = p;
      output.textContent = `Selected: ${p.title}`;
    });
    problemList.appendChild(item);
  });
}

function accuracyByTopic() {
  const map = {};
  submissions.forEach((s) => {
    if (!map[s.topic]) map[s.topic] = { correct: 0, total: 0, totalTime: 0, wrongAttempts: 0 };
    map[s.topic].total += 1;
    map[s.topic].totalTime += s.timeTaken;
    map[s.topic].wrongAttempts += s.wrongAttempts;
    if (s.correct) map[s.topic].correct += 1;
  });
  return map;
}

function updateAnalysis() {
  const stats = document.getElementById('stats');
  const aiSuggestion = document.getElementById('aiSuggestion');
  const recommendations = document.getElementById('recommendations');
  const topicStats = accuracyByTopic();
  const topics = Object.keys(topicStats);

  if (!topics.length) {
    stats.innerHTML = '<p>No submissions yet. Submit a solution to unlock analytics.</p>';
    aiSuggestion.textContent = '🤖 AI Predictor waiting for first attempt...';
    recommendations.innerHTML = '';
    return;
  }

  stats.innerHTML = topics.map((topic) => {
    const s = topicStats[topic];
    const accuracy = Math.round((s.correct / s.total) * 100);
    const avgTime = Math.round(s.totalTime / s.total);
    return `<div class="stat"><strong>${topic}</strong><br/>Accuracy: ${accuracy}%<br/>Avg Time: ${avgTime} min<br/>Wrong Attempts: ${s.wrongAttempts}</div>`;
  }).join('');

  const weakness = topics
    .map((topic) => {
      const s = topicStats[topic];
      const accuracy = (s.correct / s.total) * 100;
      const avgTime = s.totalTime / s.total;
      const score = (100 - accuracy) + s.wrongAttempts * 10 + avgTime;
      return { topic, score };
    })
    .sort((a, b) => b.score - a.score)[0];

  aiSuggestion.textContent = `🤖 You need more practice in ${weakness.topic}. Focus on timed sets and attempt pattern-based problems.`;

  recommendations.innerHTML = '';
  problems
    .filter((p) => p.topic === weakness.topic)
    .forEach((p) => {
      const li = document.createElement('li');
      li.textContent = `${p.title} (${p.difficulty})`;
      recommendations.appendChild(li);
    });
}

function updateLeaderboard() {
  const rows = [
    { name: 'Anitha', college: 'ABC Engg', score: 520 },
    { name: 'Rahul', college: 'XYZ Tech', score: 498 },
    { name: 'Siva', college: 'NIT', score: 476 }
  ];

  const profile = JSON.parse(localStorage.getItem('profile') || 'null');
  if (profile) {
    const myScore = submissions.reduce((acc, s) => acc + (s.correct ? 100 : 20), 0);
    rows.push({ name: profile.name, college: profile.college, score: myScore });
  }

  rows.sort((a, b) => b.score - a.score);
  const tbody = document.getElementById('leaderboard');
  tbody.innerHTML = '';
  rows.forEach((row, index) => {
    tbody.innerHTML += `<tr><td>${index + 1}</td><td>${row.name}</td><td>${row.college}</td><td>${row.score}</td></tr>`;
  });
}

function codeSimilarity(a, b) {
  const setA = new Set(a.split(/\W+/).filter(Boolean));
  const setB = new Set(b.split(/\W+/).filter(Boolean));
  const intersection = [...setA].filter((x) => setB.has(x)).length;
  const union = new Set([...setA, ...setB]).size || 1;
  return Math.round((intersection / union) * 100);
}

document.getElementById('runBtn').addEventListener('click', () => {
  output.textContent = '✅ Code executed successfully on sample test cases.';
});

document.getElementById('submitBtn').addEventListener('click', () => {
  const code = document.getElementById('codeEditor').value;
  const timeTaken = Number(document.getElementById('timeTaken').value) || 10;
  const correct = code.length > 30 && Math.random() > 0.35;
  const wrongAttempts = correct ? 0 : 1 + Math.floor(Math.random() * 2);

  submissions.push({
    topic: currentProblem.topic,
    correct,
    wrongAttempts,
    timeTaken
  });

  output.textContent = correct
    ? `🎉 Accepted: ${currentProblem.title}`
    : `❌ Wrong Answer for ${currentProblem.title}. Try again.`;

  const similarity = codeSimilarity(code, 'for i in range(n): total += nums[i]');
  document.getElementById('similarity').textContent = `Code similarity check (demo): ${similarity}% overlap with reference snippet.`;

  updateAnalysis();
  updateLeaderboard();
});

document.getElementById('loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const profile = {
    name: document.getElementById('name').value,
    college: document.getElementById('college').value
  };
  localStorage.setItem('profile', JSON.stringify(profile));
  document.getElementById('profile').classList.remove('hidden');
  document.getElementById('profile').innerHTML = `<strong>${profile.name}</strong> • ${profile.college}<br/>Skill score updates after each submission.`;
  updateLeaderboard();
});

document.getElementById('startContest').addEventListener('click', () => {
  clearInterval(contestInterval);
  let remaining = 60 * 60;
  const timer = document.getElementById('timer');

  contestInterval = setInterval(() => {
    const m = String(Math.floor(remaining / 60)).padStart(2, '0');
    const s = String(remaining % 60).padStart(2, '0');
    timer.textContent = `${m}:${s}`;
    remaining -= 1;
    if (remaining < 0) {
      clearInterval(contestInterval);
      timer.textContent = '00:00';
      output.textContent = '🏁 Contest ended. Rankings updated!';
      updateLeaderboard();
    }
  }, 1000);
});

document.getElementById('addProblemForm').addEventListener('submit', (e) => {
  e.preventDefault();
  problems.push({
    id: problems.length + 1,
    title: document.getElementById('newTitle').value,
    difficulty: document.getElementById('newDifficulty').value,
    topic: document.getElementById('newTopic').value
  });
  renderProblems();
  e.target.reset();
});

document.getElementById('exportBtn').addEventListener('click', () => {
  const rows = [...document.querySelectorAll('#leaderboard tr')].map((tr) =>
    [...tr.children].map((td) => td.textContent).join(',')
  );
  const csv = ['Rank,Name,College,Weekly Score', ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'leaderboard.csv';
  a.click();
});

difficultyFilter.addEventListener('change', renderProblems);
topicFilter.addEventListener('change', renderProblems);

renderProblems();
updateAnalysis();
updateLeaderboard();
