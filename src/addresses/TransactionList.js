import React from 'react';
import PropTypes from 'prop-types';
import InfiniteScroll from 'react-infinite-scroller';

import ServiceFactory from '../services/ServiceFactory';
import TransactionListItem from './TransactionListItem';
import transactionMapper from './TransactionMapper';
import Loading from '../shared/Loading';

export default class TransactionList extends React.Component {
    state = {
        hasMore: true,
    }

    static propTypes = {
        transactions: PropTypes.arrayOf(PropTypes.object).isRequired
    };

    setAcryl(str) {
        return str.replace('WAVES', 'ACRYL');
    }

    loadMore() {
        const addressService = ServiceFactory.addressService();
        const address = this.props.address;
        let arrTransactions = this.props.transactions;
        let after = arrTransactions[arrTransactions.length-1].id;

        addressService.loadTransactions(address, 100, after).then(transactions => {
            return transactionMapper(transactions, address);
        })
            .then(transactions => {
                if (transactions.length < 100) { this.state.hasMore = false }
                for (const transaction of transactions) {
                    if(transaction.out) {
                        transaction.out.currency = this.setAcryl(transaction.out.currency);
                    }
                    if(transaction.in) {
                        transaction.in.currency = this.setAcryl(transaction.in.currency);
                    }
                    arrTransactions.push(transaction)
                }
                this.setState({ transactions: arrTransactions });
            });
    }

    render() {
        return (
            <InfiniteScroll
                initialLoad={false}
                loadMore={this.loadMore.bind(this)}
                hasMore={this.state.hasMore}
                loader={<Loading key="tx-loader"/>}
            >
                <table className="address-tr-list table-sm-transform">
                    <thead>
                        <tr>
                            <th>ID / Type</th>
                            <th className="timestamp">Timestamp</th>
                            <th>Sender / Receiver</th>
                            <th className="amount">Amount in / out</th>
                            <th className="price">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.transactions.map((tx, index) => {
                            return (<TransactionListItem key={index} tx={tx} />);
                        })}
                    </tbody>
                </table>
            </InfiniteScroll>
        );
    }
}
