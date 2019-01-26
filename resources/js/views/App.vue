<template>
    <div>
        <!-- <nav class="navbar navbar-expand-md navbar-light navbar-laravel">
            <div class="container">
            ...
            </div>
        </nav> -->
        <main class="py-4">
            <transition>
                <keep-alive>
                    <router-view></router-view>
                </keep-alive>
            </transition>
        </main>
    </div>
</template>
<script>
export default {}
</script>