-- Fix icon casing for existing social links
-- The web components use PascalCase icon names matching lucide-react exports
-- (e.g. "Github", "Linkedin", "Send", "Twitter", "Youtube", "Facebook", "Instagram", "Globe")

UPDATE social_links SET icon = 'Github'    WHERE platform = 'github'    AND icon != 'Github';
UPDATE social_links SET icon = 'Linkedin'  WHERE platform = 'linkedin'  AND icon != 'Linkedin';
UPDATE social_links SET icon = 'Send'      WHERE platform = 'telegram'  AND icon != 'Send';
UPDATE social_links SET icon = 'Twitter'   WHERE platform = 'twitter'   AND icon != 'Twitter';
UPDATE social_links SET icon = 'Youtube'   WHERE platform = 'youtube'   AND icon != 'Youtube';
UPDATE social_links SET icon = 'Facebook'  WHERE platform = 'facebook'  AND icon != 'Facebook';
UPDATE social_links SET icon = 'Instagram' WHERE platform = 'instagram' AND icon != 'Instagram';
UPDATE social_links SET icon = 'Globe'     WHERE platform = 'website'   AND icon != 'Globe';
