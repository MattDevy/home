export const config = {
  name: 'Matt Devy',
  title: 'Senior Software Engineer',
  bio: "Senior Software Engineer with a background in Cyber Security and Open Source. Focused on Go, Rust, and TypeScript — primarily backend, but comfortable across the full stack. I enjoy automation and building things that last.",
  github: 'MattDevy',
  social: {
    github: 'https://github.com/MattDevy',
    linkedin: 'https://linkedin.com/in/matthew-devy',
    // email: 'mailto:...',
    // buyMeACoffee: 'https://buymeacoffee.com/...',
  },
  /**
   * Optionally list repo slugs here to control ordering/filtering in the
   * showcase. If empty, all public non-fork repos are shown sorted by stars.
   */
  featuredRepos: ['pi-continuous-learning'] as string[],
}

export type SocialLinks = typeof config.social
