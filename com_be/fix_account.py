import sys

with open('com-passion/src/pages/Account.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add useState variables
content = content.replace('  const [resetSent, setResetSent] = useState(false);', '  const [resetSent, setResetSent] = useState(false);\n  const [showAllOrders, setShowAllOrders] = useState(false);')

# Compute displayed orders
target = '  const meals = Math.floor(totalContribution / 25000); // ~25k/bữa, ước tính'
content = content.replace(target, target + '\n\n  const displayedOrders = showAllOrders ? user.orders : user.orders.slice(0, 2);')

# Map displayedOrders instead of user.orders
content = content.replace('{user.orders.map((o) => (', '{displayedOrders.map((o) => (')

# Add the 'Xem thêm' button
target_end = '                  </motion.article>\n                ))}\n              </div>'
replacement_end = '''                  </motion.article>
                ))}
                {user.orders.length > 2 && (
                  <motion.div variants={fadeUp} style={{ textAlign: "center", marginTop: "1rem" }}>
                    <button
                      className="btn btn--outline interactive"
                      onClick={() => setShowAllOrders(!showAllOrders)}
                      style={{
                        background: "transparent",
                        borderColor: "var(--clay-500)",
                        color: "var(--clay-700)",
                        padding: "0.5rem 1.5rem"
                      }}
                    >
                      {showAllOrders ? "Thu gọn" : `Xem thêm ${user.orders.length - 2} đơn hàng cũ hơn`}
                    </button>
                  </motion.div>
                )}
              </div>'''

content = content.replace(target_end, replacement_end)

with open('com-passion/src/pages/Account.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
