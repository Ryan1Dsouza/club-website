const fs = require('fs');

const scraped = JSON.parse(fs.readFileSync('tmp/perfect-scraped.json'));
const portraits = JSON.parse(fs.readFileSync('src/lib/team-portraits.json'));

for (const [key, value] of Object.entries(portraits)) {
  const nameMatch = key.match(/\/([^\/]+)\.avif$/);
  if (nameMatch) {
    let nameHint = nameMatch[1];
    if (nameHint === 'Sweeden') nameHint = 'Sweedan';
    
    const scrapedMember = scraped.find(s => s.name.includes(nameHint) || s.name.split(' ')[0] === nameHint);
    
    if (scrapedMember) {
      if (scrapedMember.quote && scrapedMember.quote !== 'turning coffee into algorithms' && scrapedMember.quote !== 'Turning coffee into algorithms') {
        value.tagline = scrapedMember.quote.replace('PasiA3n', 'Pasión');
      } else if (!scrapedMember.quote || scrapedMember.quote === 'turning coffee into algorithms' || scrapedMember.quote === 'Turning coffee into algorithms') {
        value.tagline = 'turning coffee into algorithms';
      }
      
      const socials = {};
      for (const link of scrapedMember.links) {
        if (link.includes('linkedin.com')) socials.linkedin = link;
        if (link.includes('github.com')) socials.github = link;
        if (link.includes('leetcode.com')) socials.leetcode = link;
        if (link.includes('instagram.com')) socials.instagram = link;
      }
      
      if (Object.keys(socials).length > 0) {
        value.socials = socials;
      } else {
        delete value.socials; // remove if they have none
      }
    }
  }
}

fs.writeFileSync('src/lib/team-portraits.json', JSON.stringify(portraits, null, 2));
