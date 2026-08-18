import * as fs from 'fs';
import * as path from 'path';
import {
  getCleanDisplayName,
  getGreetingFirstName,
  getGreetingTitle,
  getTimeOfDayGreeting,
} from '../src/utils/userDisplay';

let failed = false;

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ TEST FAILED: ${msg}`);
    failed = true;
  } else {
    console.log(`✅ ${msg}`);
  }
}

console.log('\n========================================');
console.log('--- 1. Root Cause Analysis & Route Collision Elimination ---');
console.log('========================================');

const rootProfileExists = fs.existsSync(path.join(process.cwd(), 'app/profile.tsx'));
const tabsProfileExists = fs.existsSync(path.join(process.cwd(), 'app/(tabs)/profile.tsx'));

assert(!rootProfileExists, 'Duplicate route app/profile.tsx is removed from root directory');
assert(tabsProfileExists, 'Canonical profile route app/(tabs)/profile.tsx exists in tabs navigator');

const rootLayoutSrc = fs.readFileSync(path.join(process.cwd(), 'app/_layout.tsx'), 'utf-8');
assert(rootLayoutSrc.includes('<Stack.Screen name="(tabs)" />'), 'Root layout registers (tabs) stack screen');
assert(rootLayoutSrc.includes('<Stack.Screen name="admin/index" />'), 'Root layout registers admin/index stack screen');
assert(rootLayoutSrc.includes('<Stack.Screen name="admin/login" />'), 'Root layout registers admin/login stack screen');
assert(rootLayoutSrc.includes('<Stack.Screen name="learn/a1" />'), 'Root layout registers learn/a1 stack screen');
assert(rootLayoutSrc.includes('<Stack.Screen name="learn/a1/mission/[missionId]" />'), 'Root layout registers lesson player stack screen');

console.log('\n========================================');
console.log('--- 2. Admin → Elevvy & Browser History Navigation ---');
console.log('========================================');

const adminIndexSrc = fs.readFileSync(path.join(process.cwd(), 'app/admin/index.tsx'), 'utf-8');
assert(adminIndexSrc.includes("router.push('/(tabs)/learn')") || adminIndexSrc.includes("router.push('/(tabs)/home')"), 'Admin Elevvy button uses router.push to create valid browser history entry');
assert(adminIndexSrc.includes('Elevvy'), 'Admin header displays Elevvy button');

console.log('\n========================================');
console.log('--- 3. Admin Preview Banner & Safe Return to /admin ---');
console.log('========================================');

const bannerSrc = fs.readFileSync(path.join(process.cwd(), 'src/components/AdminPreviewBanner.tsx'), 'utf-8');
assert(bannerSrc.includes('const { isAdmin } = useAuth()'), 'AdminPreviewBanner extracts isAdmin from verified AuthContext');
assert(bannerSrc.includes('if (!isAdmin) {\n    return null;\n  }'), 'AdminPreviewBanner strictly returns null if user is not admin');
assert(bannerSrc.includes("router.push('/admin')"), 'AdminPreviewBanner return button routes to /admin');
assert(bannerSrc.includes('Du förhandsgranskar elevvyn som administratör'), 'AdminPreviewBanner contains clear admin preview notice');
assert(bannerSrc.includes('Tillbaka till admin'), 'AdminPreviewBanner contains return button text');

const tabsLayoutSrc = fs.readFileSync(path.join(process.cwd(), 'app/(tabs)/_layout.tsx'), 'utf-8');
assert(tabsLayoutSrc.includes('<AdminPreviewBanner />'), 'Tabs layout embeds AdminPreviewBanner across all student tabs');

const learnA1Src = fs.readFileSync(path.join(process.cwd(), 'app/learn/a1.tsx'), 'utf-8');
assert(learnA1Src.includes('<AdminPreviewBanner />'), 'A1 overview screen embeds AdminPreviewBanner');

const missionPlayerSrc = fs.readFileSync(path.join(process.cwd(), 'app/learn/a1/mission/[missionId].tsx'), 'utf-8');
assert(missionPlayerSrc.includes('<AdminPreviewBanner />'), 'Mission player screen embeds AdminPreviewBanner');

const bottomNavSrc = fs.readFileSync(path.join(process.cwd(), 'src/components/BottomNav.tsx'), 'utf-8');
assert(!bottomNavSrc.includes("case 'admin':"), 'Student BottomNav does not expose admin tab');

console.log('\n========================================');
console.log('--- 4. Role Guards (Student Cannot Access /admin) ---');
console.log('========================================');

assert(adminIndexSrc.includes('!isAdmin'), 'Admin index verifies !isAdmin');
assert(adminIndexSrc.includes('Administratörsbehörighet krävs'), 'Admin index displays access denied message for students');

const adminMissionSrc = fs.readFileSync(path.join(process.cwd(), 'app/admin/mission/[id].tsx'), 'utf-8');
assert(adminMissionSrc.includes('!isAdmin'), 'Admin mission editor verifies !isAdmin');

console.log('\n========================================');
console.log('--- 5. Dynamic Greeting & Safe Fallback Unit Tests ---');
console.log('========================================');

// Case A: Real student with fullName
const user1 = { fullName: 'Abraham Dikmen', email: 'abraham.dikmen1@gmail.com', role: 'student' as const };
assert(getGreetingTitle(user1) === 'Hej, Abraham!', `Real student greeting (got: ${getGreetingTitle(user1)})`);
assert(getCleanDisplayName(user1) === 'Abraham Dikmen', `Real student display name (got: ${getCleanDisplayName(user1)})`);

// Case B: Real Admin with fullName
const userAdmin = { fullName: 'SwedishFlow Admin', email: 'admin@swedishflow.se', role: 'admin' as const };
assert(getGreetingTitle(userAdmin) === 'Hej, SwedishFlow!', `Admin greeting (got: ${getGreetingTitle(userAdmin)})`);
assert(getCleanDisplayName(userAdmin) === 'SwedishFlow Admin', `Admin display name (got: ${getCleanDisplayName(userAdmin)})`);

// Case C: User with only email (no fullName)
const userEmailOnly = { email: 'karim.hassan@test.se', role: 'student' as const };
assert(getGreetingTitle(userEmailOnly) === 'Hej, Karim.hassan!', `Email-only greeting (got: ${getGreetingTitle(userEmailOnly)})`);
assert(getCleanDisplayName(userEmailOnly) === 'Karim.hassan', `Email-only display name (got: ${getCleanDisplayName(userEmailOnly)})`);

// Case D: Admin with only role (no fullName or email)
const userAdminOnly = { role: 'admin' as const };
assert(getGreetingTitle(userAdminOnly) === 'Hej, Administratör!', `Admin role-only greeting (got: ${getGreetingTitle(userAdminOnly)})`);
assert(getCleanDisplayName(userAdminOnly) === 'Administratör', `Admin role-only display name (got: ${getCleanDisplayName(userAdminOnly)})`);

// Case E: Blank / undefined user
assert(getGreetingTitle(null) === 'Hej!', `Null user fallback greeting (got: ${getGreetingTitle(null)})`);
assert(getCleanDisplayName(null, { fallback: 'Elev' }) === 'Elev', `Null user display name fallback (got: ${getCleanDisplayName(null)})`);

// Case F: Guard against legacy mock names 'Sofia' and 'SFI Elev'
const userSofia = { fullName: 'Sofia', email: 'abraham@exempel.se', role: 'student' as const };
assert(getGreetingTitle(userSofia) === 'Hej, Abraham!', `Guard against Sofia -> falls back to email (got: ${getGreetingTitle(userSofia)})`);

const userSFIElev = { fullName: 'SFI Elev', email: 'student123@skola.se', role: 'student' as const };
assert(getGreetingTitle(userSFIElev) === 'Hej, Student123!', `Guard against SFI Elev -> falls back to email (got: ${getGreetingTitle(userSFIElev)})`);

// Time of day greeting
const timeGreeting = getTimeOfDayGreeting();
assert(['God morgon', 'God dag', 'God kväll'].includes(timeGreeting), `Time of day greeting returns valid Swedish greeting (got: ${timeGreeting})`);

console.log('\n========================================');
console.log('--- 6. Verify Screens Use Dynamic Auth User and Utilities ---');
console.log('========================================');

const homeSrc = fs.readFileSync(path.join(process.cwd(), 'app/(tabs)/home.tsx'), 'utf-8');
assert(homeSrc.includes('const { user } = useAuth()'), 'HomeScreen retrieves authenticated user from useAuth()');
assert(homeSrc.includes('getGreetingTitle(user)'), 'HomeScreen renders dynamic greeting using getGreetingTitle(user)');
assert(homeSrc.includes('getTimeOfDayGreeting()'), 'HomeScreen renders dynamic time of day greeting');
assert(!homeSrc.includes('user.firstName'), 'HomeScreen no longer references mock student firstName');
assert(!homeSrc.includes('Hej Sofia') && !homeSrc.includes('Hej, Sofia'), 'HomeScreen does not contain hardcoded Hej Sofia');

const profileSrc = fs.readFileSync(path.join(process.cwd(), 'app/(tabs)/profile.tsx'), 'utf-8');
assert(profileSrc.includes('getCleanDisplayName(user'), 'ProfileScreen uses getCleanDisplayName helper');
assert(!profileSrc.includes('Sofia'), 'ProfileScreen does not contain Sofia');

console.log('\n========================================');
console.log('--- 7. Static Code Scan for Sofia as User Name ---');
console.log('========================================');

const mockStudentSrc = fs.readFileSync(path.join(process.cwd(), 'src/data/mockStudent.ts'), 'utf-8');
assert(!mockStudentSrc.includes("firstName: 'Sofia'"), 'mockStudent.ts does not contain Sofia');

console.log('\n========================================');
console.log('--- 8. Admin Panel: No Code / JSON UI ---');
console.log('========================================');

assert(!adminIndexSrc.includes('Kursdata (JSON)'), 'Admin dashboard does not show Kursdata (JSON) tab');
assert(!adminIndexSrc.includes("activeTab === 'json'"), 'Admin dashboard does not contain JSON tab state or renderer');
assert(!adminIndexSrc.includes('jsonCard'), 'Admin dashboard does not contain jsonCard styling');
assert(!adminMissionSrc.includes('Dialogrepliker (JSON-format)'), 'Mission editor does not have raw JSON textarea for dialogue');
assert(!adminMissionSrc.includes('Fraser & Glosor (JSON-format)'), 'Mission editor does not have raw JSON textarea for vocabulary');
assert(!adminMissionSrc.includes('ID: {block.id}'), 'Mission editor does not expose raw database IDs to the customer');

console.log('\n========================================');
console.log('--- 9. Real Registered Students Source & RPC Security ---');
console.log('========================================');

const courseServiceSrc = fs.readFileSync(path.join(process.cwd(), 'src/services/courseService.ts'), 'utf-8');
assert(!courseServiceSrc.includes('Sara Nilsson'), 'courseService.ts does not contain fake student Sara Nilsson');
assert(!courseServiceSrc.includes('Ali Hassan'), 'courseService.ts does not contain fake student Ali Hassan');
assert(!courseServiceSrc.includes('Elena Rostova'), 'courseService.ts does not contain fake student Elena Rostova');
assert(courseServiceSrc.includes("admin_get_student_analytics"), 'courseService.ts calls secure admin_get_student_analytics RPC');
assert(courseServiceSrc.includes(".eq('role', 'student')"), 'courseService.ts filters strictly for student role');

const rpcMigrationPath = path.join(process.cwd(), 'supabase/migrations/20260101000002_admin_student_analytics_rpc.sql');
assert(fs.existsSync(rpcMigrationPath), 'RPC migration file exists in supabase/migrations');
const rpcMigrationSrc = fs.readFileSync(rpcMigrationPath, 'utf-8');
assert(rpcMigrationSrc.includes('public.is_admin(auth.uid())'), 'RPC function validates is_admin on the server side');
assert(rpcMigrationSrc.includes('SECURITY DEFINER'), 'RPC function is SECURITY DEFINER');
assert(rpcMigrationSrc.includes('SET search_path = public, pg_temp'), 'RPC function uses safe search_path');
assert(rpcMigrationSrc.includes("ur.role = 'student'"), 'RPC function excludes admins and selects only registered students');

if (failed) {
  console.error('\n❌ FRONTEND FIX TESTS FAILED!\n');
  process.exit(1);
} else {
  console.log('\n🎉 ALL FRONTEND & NAVIGATION FIX TESTS PASSED PERFECTLY!\n');
}
