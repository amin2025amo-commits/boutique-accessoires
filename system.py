import os
import json
import datetime

class Order:
    def __init__(self, order_id, customer_name, order_date, total_cost):
        self.order_id = order_id
        self.customer_name = customer_name
        self.order_date = order_date
        self.total_cost = total_cost

    def to_dict(self):
        return {
            'order_id': self.order_id,
            'customer_name': self.customer_name,
            'order_date': self.order_date,
            'total_cost': self.total_cost
        }

class OrderSystem:
    def __init__(self, data_file):
        self.data_file = data_file
        self.orders = self.load_orders()

    def load_orders(self):
        if os.path.exists(self.data_file):
            with open(self.data_file, 'r') as f:
                return json.load(f)
        else:
            return {}

    def save_orders(self):
        with open(self.data_file, 'w') as f:
            json.dump(self.orders, f)

    def add_order(self, order):
        self.orders[order.order_id] = order.to_dict()
        self.save_orders()

    def view_orders(self):
        for order in self.orders.values():
            print(f"Order ID: {order['order_id']}")
            print(f"Customer Name: {order['customer_name']}")
            print(f"Order Date: {order['order_date']}")
            print(f"Total Cost: {order['total_cost']}")
            print("------------------------")

# Usage
order_system = OrderSystem('orders.json')
order1 = Order(1, 'John Doe', datetime.date.today().strftime("%Y-%m-%d"), 100.0)
order2 = Order(2, 'Jane Doe', datetime.date.today().strftime("%Y-%m-%d"), 200.0)

order_system.add_order(order1)
order_system.add_order(order2)

order_system.view_orders()
