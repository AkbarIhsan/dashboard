export default defineNuxtRouteMiddleware((to, from) => {
  const token = useCookie('token') // cookie bisa diakses di server
  if (!token.value && to.path !== '/') {
    return navigateTo('/')
  }
})
