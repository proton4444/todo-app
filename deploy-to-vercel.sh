#!/bin/bash

# Deployment Script for Vercel Projects
# Usage: ./deploy-to-vercel.sh <app-name> <project-url>

# Colors for output
GREEN='\033[0m'
RED='\033[0m'
YELLOW='\033[1;33m'
BLUE='\033[34m'

# Check if dependencies are installed
check_dependencies() {
    if ! command -v vercel &> /dev/null; then
        echo -e "${RED}Error: Vercel CLI not installed. Install it with:"
        echo -e "  npm install -g vercel"
        exit 1
    fi
}

# Parse arguments
if [ $# -lt 2 ]; then
    echo -e "${RED}Error: Missing required arguments."
    echo -e "${YELLOW}Usage: $0 <app-name> <project-url>"
    exit 1
fi

APP_NAME="$1"
PROJECT_URL="$2"

# Display info
echo -e "${BLUE}=== Vercel Deployment Script ==="
echo -e "App Name: ${GREEN}$APP_NAME${NC}"
echo -e "Project URL: ${GREEN}$PROJECT_URL${NC}"
echo ""

# Step 1: Get app URL
echo -e "${YELLOW}Step 1: Get your Vercel app URL from deployment page${NC}"
echo -e "  1. Go to: https://vercel.com/knossoclaws-projects"
echo -e "  2. Click on ${GREEN}$APP_NAME${NC} project"
echo -e "  3. Go to Deployments tab"
echo -e "  4. Copy URL from latest deployment"
echo -e "  Format: ${BLUE}https://xxx.vercel.app${NC} (replace xxx with your actual URL)"
echo -e ""

# Step 2: Create Vercel Postgres (Optional)
echo -e "${YELLOW}Step 2: Create Vercel Postgres database (Optional for MVP skip)${NC}"
echo -e "  ${BLUE}Skip this step for MVP (use localStorage)${NC}"
echo -e "  ${BLUE}Press Enter to skip or type 'postgres' to create:"
echo -e ""
read -r -p "> "Create Postgres? (y/postgres/skip): "

if [[ "$REPLY" == "y" || "$REPLY" == "Y" ]]; then
    echo -e "${YELLOW}Creating Vercel Postgres database..."
    echo -e "  Database name: ${GREEN}$APP_NAME-postgres${NC}"
    echo -e "  Plan: Hobby (Free)"
    echo -e "  Region: Choose nearest (e.g., us-east-1)"
    # Note: Actual deployment would use Vercel dashboard commands
    # This script guides the user through the process
    echo -e "${BLUE}✅ Vercel Postgres would be created (manual deployment)"
else
    echo -e "${GREEN}Skipping Postgres - using localStorage for MVP${NC}"
fi

# Step 3: Add environment variables
echo -e "${YELLOW}Step 3: Add environment variables in Vercel dashboard${NC}"
echo -e "  Variables to add:"
echo -e "  ${GREEN}NEXTAUTH_SECRET${NC} - Your auth secret (generated with: openssl rand -base64 32)"
echo -e "  ${GREEN}NEXTAUTH_URL${NC} - Your app URL from Step 1"
echo -e "  ${GREEN}DATABASE_URL${NC} - Your Vercel Postgres connection string (optional - leave empty for localStorage)"
echo -e ""
echo -e "${BLUE}Instructions:${NC}"
echo -e "  1. Go to: https://vercel.com/knossoclaws-projects"
echo -e "  2. Click on your project → Settings → Environment Variables"
echo -e "  3. Add the variables (copy-paste each value exactly)"
echo -e "  4. Click Redeploy or wait for auto-redeploy"
echo -e "  5. Your app will be LIVE at the new URL!"
echo -e ""

# Done message
echo -e "${GREEN}=== Deployment Ready ===${NC}"
echo -e "${BLUE}Follow steps above to complete Vercel deployment in ~5 minutes.${NC}"
echo -e ""
