using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebAPI_FlowerShopSWP.Models;

namespace WebAPI_FlowerShopSWP.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly FlowerEventShopsContext _context;

        public OrdersController(FlowerEventShopsContext context)
        {
            _context = context;
        }

        // GET: api/Orders
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Order>>> GetOrders()
        {
            return await _context.Orders.ToListAsync();
        }

        // GET: api/Orders/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Order>> GetOrder(int id)
        {
            var order = await _context.Orders.FindAsync(id);

            if (order == null)
            {
                return NotFound();
            }

            return order;
        }


        [HttpPost("addtocart")]
        public async Task<IActionResult> AddToCart(int flowerId, int quantity, int userId)
        {
            Console.WriteLine($"Attempting to add to cart for userId: {userId}");

            // Kiểm tra xem người dùng có tồn tại không
            var existingUser = await _context.Users.FindAsync(userId);
            if (existingUser == null)
            {
                return BadRequest("Người dùng không tồn tại.");
            }

            // Kiểm tra nếu người dùng có đơn hàng đang chờ
            var existingOrder = await _context.Orders
                .FirstOrDefaultAsync(o => o.UserId == userId && o.OrderStatus == "Pending");

            if (existingOrder == null)
            {
                // Tạo đơn hàng mới nếu không có
                existingOrder = new Order
                {
                    UserId = userId,
                    OrderDate = DateTime.Now,
                    OrderStatus = "Pending",
                    DeliveryAddress = "Default Address"
                };
                _context.Orders.Add(existingOrder);
                await _context.SaveChangesAsync(); // Lưu để lấy orderId
            }

            // Thêm hoa vào danh sách đơn hàng
            var orderItem = new OrderItem
            {
                OrderId = existingOrder.OrderId,
                FlowerId = flowerId,
                Quantity = quantity,
                Price = (await _context.Flowers.FindAsync(flowerId)).Price // Lấy giá hoa
            };

            _context.OrderItems.Add(orderItem); // Thêm vào bảng OrderItems
            await _context.SaveChangesAsync();

            return Ok(new { message = "Sản phẩm đã được thêm vào giỏ hàng." });
        }

        [HttpPost]
        public async Task<ActionResult<Order>> PostOrder(Order order)
        {
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetOrder", new { id = order.OrderId }, order);
        }



        

        // PUT: api/Orders/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutOrder(int id, Order order)
        {
            if (id != order.OrderId)
            {
                return BadRequest();
            }

            _context.Entry(order).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!OrderExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Orders
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
       
        [HttpPut("updatecartitem")]
        public async Task<IActionResult> UpdateCartItem(int orderItemId, int quantity)
        {
            var orderItem = await _context.OrderItems.FindAsync(orderItemId);
            if (orderItem == null)
            {
                return NotFound("Sản phẩm không tồn tại trong giỏ hàng.");
            }

            orderItem.Quantity = quantity;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Số lượng sản phẩm đã được cập nhật." });
        }

        [HttpDelete("removecartitem/{orderItemId}")]
        public async Task<IActionResult> RemoveCartItem(int orderItemId)
        {
            var orderItem = await _context.OrderItems.FindAsync(orderItemId);
            if (orderItem == null)
            {
                return NotFound("Sản phẩm không tồn tại trong giỏ hàng.");
            }

            _context.OrderItems.Remove(orderItem);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Sản phẩm đã được xóa khỏi giỏ hàng." });
        }

        // DELETE: api/Orders/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null)
            {
                return NotFound();
            }

            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool OrderExists(int id)
        {
            return _context.Orders.Any(e => e.OrderId == id);
        }
    }
}
