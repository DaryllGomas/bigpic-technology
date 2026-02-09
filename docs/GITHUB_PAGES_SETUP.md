# GitHub Pages Deployment Guide

Follow these steps to deploy your Big Pic Solutions website to GitHub Pages with a working contact form.

## Prerequisites
- A GitHub account
- Git installed on your computer (optional, can use GitHub web interface)

## Step 1: Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **+** icon in the top right → **New repository**
3. Name it `BigPicSolutions` (or any name you prefer)
4. Keep it **Public** (required for free GitHub Pages hosting)
5. **Don't** initialize with README (we already have files)
6. Click **Create repository**

## Step 2: Upload Your Files

### Option A: Using Git Command Line
```bash
cd C:\Users\Iccanui\Documents\Projects\BigPicSolutions
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/BigPicSolutions.git
git push -u origin main
```

### Option B: Using GitHub Web Interface
1. Click **uploading an existing file** on your new repo page
2. Drag and drop all files from your BigPicSolutions folder
3. Write a commit message like "Initial website upload"
4. Click **Commit changes**

## Step 3: Enable GitHub Pages

1. In your repository, go to **Settings** (top menu)
2. Scroll down to **Pages** (left sidebar)
3. Under **Source**, select **Deploy from a branch**
4. Choose **main** branch and **/ (root)** folder
5. Click **Save**

## Step 4: Configure Contact Form

1. Edit `index.html` in your repository
2. Find this line: `action="https://formsubmit.co/YOUR_EMAIL_HERE"`
3. Replace `YOUR_EMAIL_HERE` with your actual email
4. Find this line: `value="https://YOUR_GITHUB_USERNAME.github.io/BigPicSolutions/thanks.html"`
5. Replace `YOUR_GITHUB_USERNAME` with your GitHub username
6. Commit the changes

## Step 5: Activate FormSubmit

1. Visit your site at `https://YOUR_USERNAME.github.io/BigPicSolutions`
2. Fill out the contact form and submit it once
3. Check your email for activation link from FormSubmit
4. Click the activation link
5. Your form is now active!

## Your Website URLs

- **Main site**: `https://YOUR_USERNAME.github.io/BigPicSolutions`
- **Thank you page**: `https://YOUR_USERNAME.github.io/BigPicSolutions/thanks.html`

## Contact Form Setup Summary

Your Big Pic Solutions website is now ready for GitHub Pages with a working contact form using FormSubmit!

### What We've Implemented:

1. **FormSubmit Integration** - Simple, free email form handling that works with static sites
2. **Thank You Page** - Professional confirmation page after form submission
3. **Custom Domain Ready** - Already configured for bigpicsolutions.com
4. **No Backend Required** - Perfect for GitHub Pages hosting

### To Complete Setup:

1. **Replace the email**: In `index.html`, change `YOUR_EMAIL_HERE` to your actual email address
2. **Push to GitHub**: Your site appears to already be connected (you have a .git folder)
3. **Activate the form**: After deploying, submit the form once and click the activation link FormSubmit sends you

### How It Works:

- When someone fills out your contact form, FormSubmit receives the data
- They email it directly to your specified address
- The user is redirected to your custom thank you page
- No sign-up, no monthly fees, no complications!

### Features Included:

- ✅ Spam protection (honeypot method)
- ✅ Custom email subject line
- ✅ Professional thank you page
- ✅ No captcha (better user experience)
- ✅ Works with your custom domain

That's it! Super simple and effective. Your AI-powered tech support business now has a professional web presence with a working contact system.