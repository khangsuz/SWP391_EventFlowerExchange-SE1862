using System;
using System.Collections.Generic;

namespace WebAPI_FlowerShopSWP.Models;

public partial class Notification
{
    public int NotificationId { get; set; }

    public int UserId { get; set; }

    public string Message { get; set; } = null!;

    public DateTime? NotificationDate { get; set; }

    public bool? IsRead { get; set; }

    public virtual User User { get; set; } = null!;
}
