const fs = require('fs');
const env = fs.readFileSync('.env', 'utf-8');
const key = env.split('\n').find(l => l.startsWith('GEMINI_API_KEY=')).split('=')[1].trim();
fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`)
  .then(r => r.json())
  .then(d => console.log(d.models.map(m => m.name).join(', ')))
  .catch(console.error);
    for await (const model of response) {
      console.log(model.name);
    }
  } catch (e) {
    console.error(e);
  }
}
run();
