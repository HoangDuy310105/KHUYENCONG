using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using KhuyenCong.Core.Interfaces;
using KhuyenCong.Data.Context;
using Microsoft.EntityFrameworkCore;

namespace KhuyenCong.Data.Repositories;

public class Repository<T> : IRepository<T> where T : class
{
    protected readonly KhuyenCongDbContext _context;
    protected readonly DbSet<T> _dbSet;

    public Repository(KhuyenCongDbContext context)
    {
        _context = context;
        _dbSet = context.Set<T>();
    }

    public async Task<T?> GetByIdAsync(Guid id)
    {
        return await _dbSet.FindAsync(id);
    }

    public async Task<IEnumerable<T>> GetAllAsync(Expression<Func<T, bool>>? filter = null, string includeProperties = "")
    {
        IQueryable<T> query = _dbSet;
        if (filter != null)
        {
            query = query.Where(filter);
        }
        foreach (var includeProperty in includeProperties.Split(new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries))
        {
            query = query.Include(includeProperty);
        }
        return await query.ToListAsync();
    }

    public async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> expression, string includeProperties = "")
    {
        IQueryable<T> query = _dbSet;
        foreach (var includeProperty in includeProperties.Split(new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries))
        {
            query = query.Include(includeProperty);
        }
        return await query.Where(expression).ToListAsync();
    }

    public async Task<(IEnumerable<T> Items, int TotalCount)> GetPagedAsync(int page, int pageSize, Expression<Func<T, bool>>? filter = null, string includeProperties = "")
    {
        IQueryable<T> query = _dbSet;
        if (filter != null)
        {
            query = query.Where(filter);
        }
        foreach (var includeProperty in includeProperties.Split(new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries))
        {
            query = query.Include(includeProperty);
        }
        var totalCount = await query.CountAsync();

        // BUG-04 FIX: Thêm ORDER BY mặc định theo thời gian tạo giảm dần
        // Đảm bảo kết quả phân trang nhất quán, không bị trùng hoặc bỏ sót bản ghi
        // khi người dùng chuyển trang.
        var items = await query
            .OrderByDescending(e => EF.Property<DateTime>(e, "CreatedAt"))
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }

    public async Task AddAsync(T entity)
    {
        await _dbSet.AddAsync(entity);
    }

    public async Task AddRangeAsync(IEnumerable<T> entities)
    {
        await _dbSet.AddRangeAsync(entities);
    }

    public void Update(T entity)
    {
        _dbSet.Update(entity);
    }

    public void Remove(T entity)
    {
        _dbSet.Remove(entity);
    }

    public void RemoveRange(IEnumerable<T> entities)
    {
        _dbSet.RemoveRange(entities);
    }
}
