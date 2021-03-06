/**
 * 信息上传部分的数据处理
 */

// 借方头
const borrowHeader = {
    type: 'header',
    subject: '借方科目',
    money: '借方金额',
    number: '发票号',
    companyName: '交易对手方'
};

// 贷方头
const loanHeader = {
    type: 'header',
    subject: '贷方科目',
    money: '贷方金额',
    number: '回单号',
    companyName: '汇款对手方'
};

export default {

    /**
     * 原始数据到 UI 数据
     *
     * @param {Array} originalData 原始数据
     */
    getArtificialTableDataList(originalData) {
        const result = [];
        if (originalData && originalData.length > 0) {
            originalData.forEach(item => {
                // 借方数据
                const borrowColumnDataList = [];
                if (Array.isArray(item.borrow)) {
                    item.borrow.forEach(item => {
                        borrowColumnDataList.push({
                            type: 'borrow',
                            subject: item.subject,
                            money: item.money,
                            number: item.number,
                            companyName: item.companyName
                        });
                    });
                }
                
                // 贷方数据
                const loanColumnDataList = [];
                if (Array.isArray(item.loan)) {
                    item.loan.forEach(item => {
                        loanColumnDataList.push({
                            type: 'loan',
                            subject: item.subject,
                            money: item.money,
                            number: item.number,
                            companyName: item.companyName
                        });
                    });
                }

                const data = {
                    headerData: {
                        date: item.date,
                        des: item.des
                    },
                    columnData: [
                        borrowHeader,
                        ...borrowColumnDataList,
                        loanHeader,
                        ...loanColumnDataList
                    ]
                };

                result.push(data);
            });
        }
        return result;
    },

    /**
     * 获取一条新 分录 信息
     */
    getOneNewArtificialTableData() {
        return {
            isNew: true,
            headerData: {
                date: '',
                des: ''
            },
            columnData: [
                borrowHeader,
                {
                    type: 'borrow',
                    subject: '',
                    money: '',
                    number: '',
                    companyName: ''
                },
                {
                    type: 'borrow',
                    subject: '',
                    money: '',
                    number: '',
                    companyName: ''
                },
                {
                    type: 'borrow',
                    subject: '',
                    money: '',
                    number: '',
                    companyName: ''
                },
                loanHeader,
                {
                    type: 'loan',
                    subject: '',
                    money: '',
                    number: '',
                    companyName: ''
                },
                {
                    type: 'loan',
                    subject: '',
                    money: '',
                    number: '',
                    companyName: ''
                },
                {
                    type: 'loan',
                    subject: '',
                    money: '',
                    number: '',
                    companyName: ''
                }
            ]
        };
    },

    /**
     * 将表格数据转换为可提交的后端数据
     *
     * @param {Array} tableData 表格数据
     */
    transTableData(tableData) {
        const result = [];
        tableData.forEach(item => {
            // 目标格式
            const dataItem = {
                date: '',
                des: '',
                borrow: [],
                loan: []
            }
            if (item.isNew) {
                if (item.headerData.date) {
                    dataItem.date = item.headerData.date.getTime();
                }
                dataItem.des = item.headerData.des;
                item.columnData.forEach(columnItem => {
                    const data = {
                        subject: columnItem.subject,
                        money: columnItem.money,
                        number: columnItem.number,
                        companyName: columnItem.companyName
                    };
                    if (columnItem.type === 'borrow') {
                        dataItem.borrow.push(data);
                    }
                    else if (columnItem.type === 'loan') {
                        dataItem.loan.push(data);
                    }
                });
                result.push(dataItem);
            }
        });

        return result;
    }
}