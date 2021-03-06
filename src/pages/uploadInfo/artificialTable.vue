<template>
<section class="artificial-table-section">
    <div class="tip-info" v-if="switchValue">
        <div>提示:</div>
        <div>1. 目前支持输入名称和代码两种形式</div>
        <div>2. 若输入名称，请输入一级科目后在下拉框进行选择</div>
        <div>3. 若输入代码，请输入完整代码，敲击回车生成科目</div>
    </div>
    <section v-if="currentData" class="table-section">
        <el-table
            :data="currentData.columnData"
            :header-cell-class-name="getHeaderCellClassName"
            :cell-class-name="getCellClassName"
            :highlight-current-row="false"
            border>
            <!-- 第一列，贷方科目 借方科目 -->
            <el-table-column
                label="业务日期"
                prop="subject">
                <template slot="header" class="table-header-cell">
                    业务日期
                </template>
                <template slot-scope="scope">
                    <!-- <el-input
                        v-if="currentData.isNew && scope.row.type !== 'header'"
                        v-model="scope.row.subject"
                        size="mini"
                        placeholder="请输入"/> -->
                    <template v-if="currentData.isNew && scope.row.type !== 'header'">
                        <el-select
                            v-if="scope.row.type === 'borrow'"
                            v-model="scope.row.subject"
                            filterable
                            reserve-keyword
                            placeholder="请输入"
                            remote
                            :remote-method="borrowFilterOptions"
                            size="mini">
                                <el-option
                                    v-for="item in options"
                                    :key="item.code"
                                    :label="item.text"
                                    :value="item.code">
                                </el-option>
                        </el-select>
                        <el-select
                            v-else
                            v-model="scope.row.subject"
                            filterable
                            reserve-keyword
                            placeholder="请输入"
                            remote
                            :remote-method="loanFilterOptions"
                            size="mini">
                                <el-option
                                    v-for="item in options"
                                    :key="item.code"
                                    :label="item.text"
                                    :value="item.code">
                                </el-option>
                        </el-select>
                    </template>
                    
                    <template v-else>
                        {{ scope.row.subject }}
                    </template>
                </template>
            </el-table-column>
            <!-- 第二列 日期选择 借方金额 贷方金额 -->
            <el-table-column prop="money">
                <template slot="header" slot-scope="scope">
                    <el-date-picker
                        v-if="currentData.isNew"
                        v-model="currentData.headerData.date"
                        type="date"
                        size="mini"
                        placeholder="选择日期">
                    </el-date-picker>
                    <template v-else>
                        {{formateDate(currentData.headerData.date)}}
                    </template>
                </template>
                <template slot-scope="scope">
                    <el-input
                        v-if="currentData.isNew && scope.row.type !== 'header'"
                        v-model="scope.row.money"
                        size="mini"
                        placeholder="请输入"/>
                    <template v-else>
                        {{ scope.row.money }}
                    </template>
                </template>
            </el-table-column>
            <!-- 第三列 发票号 回单号 -->
            <el-table-column
                label="业务描述"
                prop="number">
                <template slot-scope="scope">
                    <el-input
                        v-if="currentData.isNew && scope.row.type !== 'header'"
                        v-model="scope.row.number"
                        size="mini"
                        placeholder="请输入"/>
                    <template v-else>
                        {{ scope.row.number }}
                    </template>
                </template>
            </el-table-column>
            <!-- 第四列 业务描述 交易对手方 汇款对手方 -->
            <el-table-column prop="companyName">
                <template slot="header" slot-scope="scope">
                    <el-input
                        v-if="currentData.isNew"
                        v-model="currentData.headerData.des"
                        size="mini"
                        placeholder="请输入业务描述"/>
                    <template v-else>
                        {{currentData.headerData.des}}
                    </template>
                </template>
                <template slot-scope="scope">
                    <el-input
                        v-if="currentData.isNew && scope.row.type !== 'header'"
                        v-model="scope.row.companyName"
                        size="mini"
                        placeholder="请输入"/>
                    <template v-else>
                        {{ scope.row.companyName }}
                    </template>
                </template>
            </el-table-column>
        </el-table>
        <div class="button-line">
            <el-button
                type="primary"
                size="mini"
                :disabled="activedIndex === 0"
                @click="switchActivedIndex(-1)"
                class="previous">
                上一条
            </el-button>
            <div>
                {{ activedIndex + 1}} / {{ artificialTableDataList.length }}
            </div>
            <el-button
                v-if="activedIndex === (artificialTableDataList.length - 1) && switchValue"
                type="primary"
                size="mini"
                @click="addOneArtificial"
                class="next">
                新增一条
            </el-button>
            <el-button
                type="primary"
                size="mini"
                :disabled="activedIndex === (artificialTableDataList.length - 1)"
                @click="switchActivedIndex(1)"
                class="next">
                下一条
            </el-button>
        </div>
    </section>
    <div v-else class="empty-data tip-info">
        暂无分录信息
    </div>
</section>
</template>
<script>
/**
 * @file 上传资料页
 */
/**
 * @file 上传资料页
 */
import dataHelper from './dataHelper';
import utiles from '@/components/utiles';
import map from '@/components/map';

export default {
    props: {
        switchValue: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            accountBillData: {},
            activedIndex: 0,
            artificialTableDataList: [],
            currentData: null,
            options: []
        };
    },
    watch: {
        switchValue(value) {
            if (value === false) {
                // 去除新加的分录
                this.artificialTableDataList.some((item, index) => {
                    if (item.isNew) {
                        const total = this.artificialTableDataList.length - index;
                        this.artificialTableDataList.splice(index, total);
                        return true;
                    }
                });
                if (this.activedIndex > this.artificialTableDataList.length - 1) {
                    this.activedIndex = this.artificialTableDataList.length - 1;
                    this.currentData = this.artificialTableDataList[this.activedIndex];
                }
            }
        }
    },
    mounted() {
        const str = localStorage.getItem('currentAccountBill');
        const data = JSON.parse(str);
        this.accountBillData = data;

        // 获取上传相关信息
        this.$http.get('/accountBills/getInfo', {
            compamyName: data.compamyName
        }).then(res => {
            this.artificialTableDataList = dataHelper.getArtificialTableDataList(res.data.artificialInput);
            if (this.artificialTableDataList.length > 0) {
                this.currentData = this.artificialTableDataList[0];
            }
        });
    },
    methods: {

        /**
         * 获取表头 class name
         */
        getHeaderCellClassName(data) {
            let className = 'table-body-cell';
            if (data.columnIndex % 2 === 0) {
                className = 'table-header-cell';
            }
            return className;
        },

        /**
         * 获取单元格 class name
         */
        getCellClassName(data) {
            let className = '';
            if (data.row.type === 'header') {
                className = 'table-header-cell';
            }
            return className;
        },

        /**
         * 格式化日期
         */
        formateDate(value) {
            let result = '';
            if (value) {
                result = utiles.formateDate(value);
            }
            return result;
        },

        switchActivedIndex(value) {
            this.activedIndex += value;
            this.currentData = this.artificialTableDataList[this.activedIndex];
        },

        /**
         * 添加一行
         */
        addOneArtificial() {
            const oneArtificial = dataHelper.getOneNewArtificialTableData();
            this.artificialTableDataList.push(oneArtificial);
            this.activedIndex++;
            this.currentData = this.artificialTableDataList[this.activedIndex];
        },

        /**
         * 借方科目过滤
         */
        borrowFilterOptions(value) {
            this.filterOptions('borrow', value);
        },

        /**
         * 贷方科目过滤
         */
        loanFilterOptions(value) {
            this.filterOptions('loan', value);
        },

        /**
         * 科目过滤
         */
        filterOptions(type, value) {
            this.options = [];
            map[type].forEach(item => {
                if (item.text.indexOf(value) > -1 || item.code.indexOf(value) > -1) {
                    this.options.push(item);
                }
            });
        },

        /**
         * 获取新添加的分录数据
         */
        getData() {
            return dataHelper.transTableData(this.artificialTableDataList);
        }
    }
};
</script>
<style lang="less" scoped>
@import '../../assets/var.less';
.artificial-table-section {
    .button-line {
        display: flex;
        padding: 10px 0;
        .previous,
        .next {
            flex: 0 0 68px;
        }
        > div {
            flex: 1;
            text-align: center;
        }
    }
}
</style>