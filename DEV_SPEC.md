# Matrix Solutions - Technical Development Specification

## 1. Routes & Page Architecture

| Route | Page Type | Description |
| :--- | :--- | :--- |
| `/` | Home | High-level value prop, sector routing, and social proof. |
| `/solutions` | Category Index | Grid of the 4-5 main solution pillars. |
| `/solutions/[category]` | Category Detail | Deep dive into a pillar (e.g., HCM) with module tabs. |
| `/solutions/[category]/[product]` | Product Detail | Technical deep dive into a specific module (e.g., Payroll). |
| `/clients` | Client Index | Logo wall, industry filters, and case study highlights. |
| `/clients/[case-study-slug]` | Case Study | Detailed success story narrative. |
| `/about` | Static/Editorial | Company history, mission, and leadership bios. |
| `/resources` | Download Center | Filterable list of PDFs and whitepapers. |
| `/contact` | Interactive Form | Lead generation with departmental routing. |

---

## 2. CMS Data Model (Schema Definitions)

### Solution Category
- `title`: String
- `slug`: Slug (Unique)
- `description`: Text (Markdown supported)
- `icon`: Icon Identifier (Lucide name)
- `heroImage`: Image Asset
- `modules`: Reference Array (to Product Model)
- `complianceBadges`: Array of Strings

### Product (Individual Solution)
- `title`: String
- `slug`: Slug (Unique)
- `shortDescription`: String
- `fullFeatures`: Array of Objects { title, description, icon }
- `techSpecs`: Key-Value Object (e.g., Database: SQL Server)
- `relatedCaseStudies`: Reference Array (to Case Study Model)

### Case Study
- `title`: String
- `slug`: Slug (Unique)
- `clientName`: String
- `industry`: Enum (Government, Finance, Corporate, NGO)
- `challenge`: Text
- `solution`: Text
- `outcomeStats`: Array of Objects { label, value }
- `featuredImage`: Image Asset
- `techStack`: Array of Strings

### Downloadable Asset
- `title`: String
- `file`: File Attachment (PDF)
- `category`: Enum (Brochure, Whitepaper, Case Study, Profile)
- `thumbnail`: Image Asset
- `description`: String

---

## 3. Reusable Component Library

### UI Atoms
- `Button`: Variants (Primary, Secondary, Ghost, Outline).
- `Badge`: Status and Category indicators.
- `Icon`: Wrapper for Lucide-React.
- `Input/Select/Textarea`: Standardized form elements with validation states.

### UI Molecules
- `Card`: Solution cards, Case Study cards, Download cards.
- `Tabs`: Horizontal navigation for module switching.
- `Accordion`: For FAQs and Methodology steps.
- `Breadcrumbs`: Path tracking for deep solution hierarchies.

### UI Organisms
- `Navbar`: Glass-morphism sticky header with mega-menu support.
- `Footer`: Multi-column site map and contact info.
- `LogoWall`: Grayscale-to-color interactive grid.
- `Hero`: Flexible variants (Full-height, Compact, Split).

---

## 4. Performance, Security & Analytics

### Performance Targets (Core Web Vitals)
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1
- **Image Optimization**: WebP/AVIF formats, lazy loading for off-screen assets.

### Security Checklist
- **SSL/TLS**: Mandatory A+ rating on SSLLabs.
- **CSP (Content Security Policy)**: Restrict script execution to trusted domains.
- **Form Security**: CSRF protection, rate limiting on Contact API, Honeypot for spam.
- **Headers**: X-Frame-Options: DENY, X-Content-Type-Options: nosniff.

### Analytics Events
- `lead_form_submit`: Triggered on successful contact form submission.
- `resource_download`: Track which PDFs are most popular.
- `solution_view`: Track interest in specific product modules.
- `client_filter_click`: Understand which industries users are interested in.

---

## 5. Implementation Options

### Option A: Next.js + Headless CMS (Modern/Agile)
*Best for: SEO performance, content agility, and modern developer experience.*
- **Frontend**: Next.js 14+ (App Router), Tailwind CSS, Framer Motion.
- **CMS**: Sanity.io or Strapi (Headless).
- **Deployment**: Vercel or AWS Amplify.
- **Data Fetching**: Server Components for SEO, Client Components for interactivity.
- **Pros**: Blazing fast page loads, excellent DX, easy content updates without redeploying.

### Option B: ASP.NET Core MVC + Integrated CMS (Enterprise/Legacy)
*Best for: Organizations with existing .NET infrastructure and strict on-prem requirements.*
- **Framework**: ASP.NET Core 8.0 MVC.
- **CMS**: Umbraco or Orchard Core (Integrated .NET CMS).
- **Database**: SQL Server.
- **Deployment**: Azure App Service or IIS (On-Prem).
- **Pros**: Unified security model with existing Matrix products, robust enterprise support, familiar stack for .NET teams.

---

## 6. Development Roadmap (Phases)

1. **Phase 1: Foundation**: Setup repo, CI/CD, and Design System (Tailwind config).
2. **Phase 2: CMS Integration**: Define schemas and seed initial content.
3. **Phase 3: Core Pages**: Build Home, Solutions, and About.
4. **Phase 4: Interactive Features**: Contact form, search, and client filters.
5. **Phase 5: Optimization**: SEO audit, performance tuning, and security hardening.
