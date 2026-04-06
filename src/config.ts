export const config = {
  name: 'Matt Devy',
  title: 'Senior Software Engineer',
  bio: 'Building things on the web.',
  github: 'MattDevy',
  social: {
    github: 'https://github.com/MattDevy',
    // linkedin: 'https://linkedin.com/in/...',
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
