using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace KhuyenCong.Core.Interfaces;

public interface IRepository<T> where T : class
{
    Task<T?> GetByIdAsync(Guid id);
    Task<IEnumerable<T>> GetAllAsync();
    Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> expression);
    Task<(IEnumerable<T> Items, int TotalCount)> GetPagedAsync(int page, int pageSize, Expression<Func<T, bool>>? filter = null);
    
    Task AddAsync(T entity);
    Task AddRangeAsync(IEnumerable<T> entities);
    
    void Update(T entity);
    
    void Remove(T entity);
    void RemoveRange(IEnumerable<T> entities);
}
