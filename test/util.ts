export const mock_data = {
    supportedInterfaceIds: ['0x01ffc9a7', '0xd9b67a26', '0x2a55205a'], //[erc165, erc1155, erc2981]
    unSupportedInterfaceIds: ['0x80ac58cd'], //[erc721]
    uri: 'vaulthillnfts',
    newUri: 'randomuri',
    tokenIdZero: 0,
    tokenIdOne: 1,
    tokenIdTwo: 2,
    tokenAmount: {
        single: 1,
        multiple: 30
    },
    royaltyValue: 2500,
    getRoyaltyAmount: (value: number, tokens: number) => {
        return Math.floor((tokens * value) / 10000);
    }
}