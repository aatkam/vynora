import 'dotenv/config';
import { connectDB } from './config/db.js';
import User from './models/User.js';
import Post from './models/Post.js';
import Notification from './models/Notification.js';

await connectDB();

const demoEmails = [
  'demo@vynora.test',
  'hamza.demo@vynora.test',
  'maira.demo@vynora.test',
  'zain.demo@vynora.test',
  'ayla@example.com',
  'hamza@example.com',
  'maira@example.com',
  'zain@example.com'
];

const oldDemoUsers = await User.find({ email: { $in: demoEmails } }).select('_id');
const oldIds = oldDemoUsers.map((user) => user._id);
if (oldIds.length) {
  await Promise.all([
    Post.deleteMany({ author: { $in: oldIds } }),
    Notification.deleteMany({ $or: [{ recipient: { $in: oldIds } }, { actor: { $in: oldIds } }] }),
    User.updateMany({}, { $pull: { followers: { $in: oldIds }, following: { $in: oldIds } } }),
    User.deleteMany({ _id: { $in: oldIds } })
  ]);
}

const users = await User.create([
  {
    name: 'Vynora Demo',
    username: 'vynora_demo',
    email: 'demo@vynora.test',
    password: 'password123',
    bio: 'A demo account for exploring Vynora features.',
    location: 'Pakistan'
  },
  {
    name: 'Hamza Ali',
    username: 'hamza_demo',
    email: 'hamza.demo@vynora.test',
    password: 'password123',
    bio: 'Full-stack learner. Building one useful thing every day.',
    location: 'Islamabad, Pakistan'
  },
  {
    name: 'Maira Khan',
    username: 'maira_demo',
    email: 'maira.demo@vynora.test',
    password: 'password123',
    bio: 'Photographer, traveller and coffee enthusiast.',
    location: 'Peshawar, Pakistan'
  },
  {
    name: 'Zain Ahmed',
    username: 'zain_demo',
    email: 'zain.demo@vynora.test',
    password: 'password123',
    bio: 'Backend developer who loves clean APIs.',
    location: 'Karachi, Pakistan'
  }
]);

users[0].following = [users[1]._id, users[2]._id];
users[1].followers = [users[0]._id];
users[2].followers = [users[0]._id];
await Promise.all(users.map((user) => user.save()));

const posts = await Post.create([
  {
    author: users[0]._id,
    content: 'Welcome to Vynora. This demo account helps you test posts, follows, likes, comments and notifications.',
    likes: [users[1]._id, users[2]._id]
  },
  {
    author: users[1]._id,
    content: 'Built my first protected REST API route today. Progress feels better when you document it.',
    likes: [users[0]._id]
  },
  {
    author: users[2]._id,
    content: 'Golden hour in Peshawar. Sometimes the best content is simply noticing what is already around you.',
    imageUrl: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1200&q=80'
  },
  {
    author: users[3]._id,
    content: 'Clean code is not about cleverness. It is about making the next person comfortable changing it.'
  }
]);

posts[0].comments.push({ user: users[1]._id, text: 'The new version looks much more complete.' });
await posts[0].save();

console.log('Demo seed complete. Existing non-demo accounts were preserved.');
console.log('Demo login: demo@vynora.test / password123');
process.exit(0);
