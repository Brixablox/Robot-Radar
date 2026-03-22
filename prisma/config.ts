export const config = {
  mysql: {
    url: process.env.DATABASE_URL!,
    adapter: 'mysql2'
  }
}
