
try {
    console.log('Loading auth routes...');
    require('./src/routes/auth.routes');
    console.log('SUCCESS: auth routes');

    console.log('Loading job routes...');
    require('./src/routes/job.routes');
    console.log('SUCCESS: job routes');

    console.log('Loading assessment routes...');
    require('./src/routes/assessment.routes');
    console.log('SUCCESS: assessment routes');

    console.log('Loading candidate routes...');
    require('./src/routes/candidate.routes');
    console.log('SUCCESS: candidate routes');

    console.log('Loading application routes...');
    require('./src/routes/application.routes');
    console.log('SUCCESS: application routes');

    console.log('Loading leaderboard routes...');
    require('./src/routes/leaderboard.routes');
    console.log('SUCCESS: leaderboard routes');

    console.log('Loading resume routes...');
    require('./src/routes/resume.routes');
    console.log('SUCCESS: resume routes');

    console.log('Loading analytics routes...');
    require('./src/routes/analytics.routes');
    console.log('SUCCESS: analytics routes');

    console.log('Loading proctoring routes...');
    require('./src/routes/proctoring.routes');
    console.log('SUCCESS: proctoring routes');

} catch (e) {
    console.error('FAILED:', e.message);
    console.error('Stack:', e.stack);
}
