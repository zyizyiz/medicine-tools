<template>
    <h3>这是处理network的excel数据</h3>

    <el-upload
        v-model:file-list="fileList"
        drag
        :limit="1"
        :auto-upload="false"
        accept=".xls, .xlsx, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    >
        <div class="el-upload__text">
            Drop file here or <em>click to upload</em>
        </div>
    </el-upload>
    <div class="form-divider">单元格数据匹配：</div>
    <el-form :inline="true" :model="formInline" class="demo-form-inline">
        <el-form-item label="Common name">
            <el-input v-model="formModel.commonNameKey" :placeholder="defaultFormModel.commonName" clearable />
        </el-form-item>
        <el-form-item label="Name">
            <el-input v-model="formModel.nameKey" :placeholder="defaultFormModel.name" clearable />
        </el-form-item>
        <el-form-item label="Target">
            <el-input v-model="formModel.targetKey" :placeholder="defaultFormModel.target" clearable />
        </el-form-item>
        <el-form-item label="Result">
            <el-input v-model="formModel.resultKey" :placeholder="defaultFormModel.result" clearable />
        </el-form-item>
        <el-form-item>
            <el-button :loading="loading" type="primary" @click="handleExcelWithDownload">处理文件</el-button>
        </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue"
import { ElMessage } from 'element-plus'
import * as XLSX from "xlsx";
const loading = ref(false)
const fileList = ref([])
const defaultFormModel = {
    commonName: "Common name",
    name: "Name",
    target: "Target",
    result: "Result"
}
const formModel = ref({
    commonNameKey: "",
    nameKey: "",
    targetKey: "",
    resultKey: ""
})

let excelData = {
    commonNameIndex: -1,
    nameIndex: -1,
    targetIndex: -1,
    resultIndex: -1
}
const handleExcelWithDownload = () => {
    if (fileList.value.length === 0) {
        return ElMessage('请选择文件')
    }

    loading.value = true

    nextTick(() => {
        const file = fileList.value[0]

        const reader = new FileReader();

        reader.onload = (e) => {
            const data = e.target.result;

            // 读取 Excel 文件
            const workbook = XLSX.read(data, { type: "binary" });

            // 假设读取第一个工作表
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

            // 将工作表转换为 JSON 数据
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
            if (jsonData.length === 0) {
                loading.value = false
                return ElMessage.error('文件数据为空')
            }

            excelData = {
                nameIndex: -1,
                targetIndex: -1,
                resultIndex: -1
            }
            const commonName = formModel.value.commonNameKey != "" ? formModel.value.commonNameKey : defaultFormModel.commonName
            const name = formModel.value.nameKey != "" ? formModel.value.nameKey : defaultFormModel.name
            const target = formModel.value.targetKey != "" ? formModel.value.targetKey : defaultFormModel.target
            const result = formModel.value.resultKey != "" ? formModel.value.resultKey : defaultFormModel.result
            jsonData[0].forEach((element, index) => {
                if (element === commonName) {
                    excelData.commonNameIndex = index
                }else if (element === name) {
                    excelData.nameIndex = index
                }else if (element === target) {
                    excelData.targetIndex = index
                }else if (element === result) {
                    excelData.resultIndex = index
                }
            });
            if (excelData.nameIndex === -1 || excelData.targetIndex === -1 || excelData.resultIndex === -1) {
                loading.value = false
                return ElMessage.error('请检查表头是否正确')
            }
            
            handleExcelData(jsonData)

        };

        reader.readAsBinaryString(file.raw);
    })

    
    
}

// 导出为 Excel 文件
const exportToExcel = (resultData) => {
    // 创建新的工作簿和工作表
    const worksheet = XLSX.utils.aoa_to_sheet(resultData); // 将二维数组转换为工作表
    const workbook = XLSX.utils.book_new(); // 新建工作簿
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1'); // 将工作表添加到工作簿
    // 生成 Excel 文件并下载
    console.log("开始导出", fileList.value[0].name)
    XLSX.writeFile(workbook, fileList.value[0].name);
    loading.value = false
}

const handleExcelData = (jsonData) => {
    const resultNameObj = {

    }
    for (let index = 1; index < jsonData.length; index++) {
        const element = jsonData[index];
        const target = element[excelData.targetIndex]
        if (!target || target === "") {
            break
        }
        for (let index = 1; index < jsonData.length; index++) {
            const mateElement = jsonData[index];
            const commonName = mateElement[excelData.commonNameIndex]

            if (commonName === target) {
                const name = mateElement[excelData.nameIndex]
                if (!resultNameObj.hasOwnProperty(name)) {
                    resultNameObj[name] = []
                }
                resultNameObj[name].push(target)
            }
        }
    }
    if (Object.keys(resultNameObj).length === 0) {
        loading.value = false
        return ElMessage.error('没有匹配到数据')
    } {
        for (let index = 1; index < jsonData.length; index++) { 
            const element = jsonData[index];
            if (Object.keys(resultNameObj).length === 0) {
                // 数据为空就结束了
                break
            }
            for (const key in resultNameObj) {
                const targets = resultNameObj[key];
                const name = element[excelData.nameIndex]
                if (name === key) {
                    if (!jsonData[index][excelData.resultIndex] && jsonData[index][excelData.resultIndex] == "") {
                        loading.value = false
                        return ElMessage.error('数据有问题，当前匹配的result单元格有数据')
                    }
                    jsonData[index][excelData.resultIndex] = targets[0]
                    targets.shift()
                    if (targets.length <= 0) {
                        delete resultNameObj[key]
                    }
                    break;
                }
            }
        }
        console.log("结束了")
        exportToExcel(jsonData)
    }
    
}
</script>

<style lang="less" scoped>
.form-divider {
    margin: 10px 0;
}
</style>