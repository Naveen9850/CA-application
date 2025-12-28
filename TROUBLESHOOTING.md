# Troubleshooting Guide

## Issue: Dropdowns Not Showing Options

If you're seeing empty dropdowns for District and Court selection, try these steps:

### Solution 1: Hard Refresh Browser
1. Press **Ctrl + Shift + R** (Windows/Linux) or **Cmd + Shift + R** (Mac)
2. This clears the browser cache and reloads all JavaScript files

### Solution 2: Clear Browser Cache
1. Open Developer Tools (F12)
2. Go to Application tab → Storage → Clear site data
3. Refresh the page

### Solution 3: Clear LocalStorage Data
1. Open Developer Tools (F12)
2. Go to Console tab
3. Type: `clearAllData()`
4. Press Enter
5. Refresh the page (F5)

### Solution 4: Verify JavaScript is Loading
1. Open Developer Tools (F12)
2. Go to Console tab
3. Type: `getDistricts()`
4. Press Enter
5. You should see: `['Ahmedabad', 'Bangalore', 'Chennai', 'Delhi', 'Hyderabad', 'Kolkata', 'Mumbai', 'Pune']`

If you see an error instead, reload the page with Ctrl+Shift+R

### Solution 5: Check for JavaScript Errors
1. Open Developer Tools (F12)
2. Go to Console tab
3. Look for any red error messages
4. If you see errors related to `getDistricts` or `getCopyTypes`, the data.js file may not be loading properly

### What Should Work

After refresh, you should see:
- **District Dropdown**: Should show 8 options (Ahmedabad, Bangalore, Chennai, Delhi, Hyderabad, Kolkata, Mumbai, Pune)
- **Copy Types**: Should show 12 checkboxes with different copy type options
- **Court Dropdown**: Should populate automatically when you select a district

## Still Having Issues?

If none of the above solutions work:

1. Make sure you're opening `citizen-portal.html` NOT `index.html` directly
2. Login through the main `index.html` page with credentials:
   - **Username**: citizen
   - **Password**: demo123
3. Then navigate to the Citizen Portal

## Technical Details

The dropdowns are populated by these functions in `js/data.js`:
- `getDistricts()` - Returns list of districts
- `getCourtsForDistrict(district)` - Returns courts for a specific district  
- `getCopyTypes()` - Returns list of copy types

These are called by `initializeForm()` in `js/citizen.js` when the page loads.
