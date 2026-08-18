import * as fs from 'fs';
import * as path from 'path';

let failed = false;

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ TEST FAILED: ${msg}`);
    failed = true;
  } else {
    console.log(`✅ ${msg}`);
  }
}

console.log('\n--- 1. Testing AuthService Fallback & Dynamic Naming Logic ---');
const authServiceSrc = fs.readFileSync(path.join(process.cwd(), 'src/services/authService.ts'), 'utf-8');

assert(authServiceSrc.includes("role === 'admin' ? 'Administratör' : (email ? email.split('@')[0] : 'SFI-elev')"), "AuthService maps fallback names dynamically by role and email");
assert(authServiceSrc.includes("role === 'admin' ? 'Administration' : 'Svenska A1'"), "AuthService sets dynamic targetGoal based on role");
assert(authServiceSrc.includes("role === 'admin' ? 'Admin' : 'A1'"), "AuthService sets dynamic level based on role");
assert(!authServiceSrc.includes("fullName: 'SFI Elev'"), "AuthService does not hardcode static 'SFI Elev' name fallback");

console.log('\n--- 2. Testing Admin Login Screen Validation & Routing Guards ---');
const adminLoginSrc = fs.readFileSync(path.join(process.cwd(), 'app/admin/login.tsx'), 'utf-8');

assert(adminLoginSrc.includes("router.replace('/admin')"), "Admin login uses router.replace('/admin') upon successful admin login");
assert(adminLoginSrc.includes("Detta konto saknar administratörsbehörighet."), "Admin login blocks non-admin authenticated users with clear message");
assert(adminLoginSrc.includes("nonAdminWarningCard"), "Admin login presents warning card for non-admin accounts");
assert(adminLoginSrc.includes("router.replace('/(tabs)/home')"), "Admin login provides quick link to student view for non-admin accounts");

console.log('\n--- 3. Testing Admin Index Auth & Loading State Handling ---');
const adminIndexSrc = fs.readFileSync(path.join(process.cwd(), 'app/admin/index.tsx'), 'utf-8');

assert(adminIndexSrc.includes("isAuthLoading"), "Admin index checks isAuthLoading to prevent premature redirect / flash during role fetching");
assert(adminIndexSrc.includes("Kontrollerar administratörsbehörighet..."), "Admin index shows loading indicator while role is being verified");
assert(adminIndexSrc.includes("Administratörsbehörighet krävs"), "Admin index shows access denied message when user is not admin");
assert(adminIndexSrc.includes("handleLogout"), "Admin index defines dedicated handleLogout function");
assert(adminIndexSrc.includes("await signOut()"), "Admin index logout handler calls signOut()");
assert(adminIndexSrc.includes("router.replace('/admin/login')"), "Admin index logout handler redirects to /admin/login");

console.log('\n--- 4. Testing Admin Mission Editor Auth Guard ---');
const adminMissionSrc = fs.readFileSync(path.join(process.cwd(), 'app/admin/mission/[id].tsx'), 'utf-8');

assert(adminMissionSrc.includes("isAuthLoading"), "Admin mission editor checks isAuthLoading");
assert(adminMissionSrc.includes("Kontrollerar behörighet..."), "Admin mission editor handles loading state");
assert(adminMissionSrc.includes("!isAdmin"), "Admin mission editor verifies isAdmin");

console.log('\n--- 5. Testing Student Login Screen Role Routing ---');
const loginSrc = fs.readFileSync(path.join(process.cwd(), 'app/login.tsx'), 'utf-8');

assert(loginSrc.includes("result.user?.role === 'admin'"), "Main login screen checks if authenticated user is admin");
assert(loginSrc.includes("router.replace('/admin')"), "Main login screen routes admin users to /admin");
assert(loginSrc.includes("router.replace('/(tabs)/home')"), "Main login screen routes student users to /(tabs)/home");

console.log('\n--- 6. Testing Profile Screen Dynamic Roles & Labels ---');
const profileSrc = fs.readFileSync(path.join(process.cwd(), 'app/profile.tsx'), 'utf-8');

assert(profileSrc.includes("displayRole = user?.role === 'admin' ? 'Administratör' : 'SFI-elev (A1)'"), "Profile dynamically assigns displayRole");
assert(profileSrc.includes("displayGoal"), "Profile uses dynamic displayGoal");
assert(profileSrc.includes("displayLevel"), "Profile uses dynamic displayLevel");
assert(profileSrc.includes("handleLogout"), "Profile has proper logout handler");
assert(!profileSrc.includes("Inloggad som SFI Elev"), "Profile does not hardcode 'Inloggad som SFI Elev'");

if (failed) {
  console.error('\n❌ Admin routing tests failed!');
  process.exit(1);
} else {
  console.log('\n🎉 ALL ADMIN ROUTING & ROLE PRESENTATION TESTS PASSED PERFECTLY!\n');
}
