<script setup lang="ts">
import networkHandleExcel from "@/components/networkHandleExcel";
</script>

<template>
  <div class="page-container">
    <h1 class="title">Hello </h1>
    <div class="content">
        <networkHandleExcel></networkHandleExcel>
    </div>
    <h3 class="foot"> ByeBye </h3>
  </div>
</template>

<style lang="less" scoped>
.page-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  .title {
    text-align: center;
  }
  .content {
    flex: 1;
  }
  .foot {
    text-align: center;

  }
}
</style>
